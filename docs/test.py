import folium
import json
import math

# 데이터
data = {
    "trans_id": "6fbfaa876a704e7a83d8e65a4dd513f9",
    "routes": [
        {
            "summary": {
                "origin": {"x": 127.11023403583478, "y": 37.39434769502827},
                "destination": {"x": 127.10859622855493, "y": 37.40199450213265},
                "waypoints": [
                    {"x": 127.11341740484119, "y": 37.39639001677204}
                ]
            },
            "sections": [
                {
                    "roads": [
                        {
                            "vertexes": [
                                127.10991634747967, 37.39447145478345,
                                127.10966790676201, 37.394469584427156
                            ]
                        },
                        {
                            "vertexes": [
                                127.10966790676201, 37.394469584427156,
                                127.10968100356395, 37.396226781360426
                            ]
                        },
                        {
                            "vertexes": [
                                127.10968100356395, 37.396226781360426,
                                127.11341931516797, 37.39622783738649
                            ]
                        }
                    ]
                },
                {
                    "roads": [
                        {
                            "vertexes": [
                                127.11341931516797, 37.39622783738649,
                                127.10860261294675, 37.40240904474889
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

# 지도 초기화 (출발지 중심)
origin = data["routes"][0]["summary"]["origin"]
m = folium.Map(location=[origin["y"], origin["x"]], zoom_start=15)

# 출발지, 경유지, 목적지 추가
folium.Marker([origin["y"], origin["x"]], tooltip="출발지", icon=folium.Icon(color="green")).add_to(m)

waypoints = data["routes"][0]["summary"]["waypoints"]
for waypoint in waypoints:
    folium.Marker([waypoint["y"], waypoint["x"]], tooltip="경유지", icon=folium.Icon(color="blue")).add_to(m)

destination = data["routes"][0]["summary"]["destination"]
folium.Marker([destination["y"], destination["x"]], tooltip="목적지", icon=folium.Icon(color="red")).add_to(m)

# 모든 좌표점 수집
all_points = []
sections = data["routes"][0]["sections"]
for section in sections:
    for road in section["roads"]:
        coords = road["vertexes"]
        points = [(coords[i + 1], coords[i]) for i in range(0, len(coords), 2)]
        all_points.extend(points)
        # 경로 그리기
        folium.PolyLine(points, color="blue", weight=5, opacity=0.7).add_to(m)

# 애니메이션을 위한 JavaScript 코드 생성
js_code = f"""
    // 버스 아이콘 생성
    var busIcon = L.divIcon({{
        className: 'custom-div-icon',
        html: `
            <div style="
                position: relative;
                width: 30px;
                height: 30px;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 30px;
                    height: 30px;
                    background-color: #4285F4;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 8px rgba(0,0,0,0.5);
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 0;
                    height: 0;
                    border-left: 8px solid white;
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                "></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    }});
    
    // 버스 마커 생성
    var busMarker = L.marker({all_points[0]}, {{
        icon: busIcon,
        rotationAngle: 0
    }}).addTo(map);
    
    var points = {json.dumps(all_points)};
    var currentIdx = 0;
    
    function calculateAngle(start, end) {{
        var dx = end[1] - start[1];
        var dy = end[0] - start[0];
        var angle = Math.atan2(dx, dy) * 180 / Math.PI;
        return angle;
    }}
    
    function animateBus() {{
        if (currentIdx < points.length - 1) {{
            var startPoint = points[currentIdx];
            var endPoint = points[currentIdx + 1];
            var angle = calculateAngle(startPoint, endPoint);
            
            currentIdx++;
            var startLatLng = L.latLng(startPoint[0], startPoint[1]);
            var endLatLng = L.latLng(endPoint[0], endPoint[1]);
            
            var startTime = Date.now();
            var duration = 2000; // 2초
            
            function animate() {{
                var now = Date.now();
                var progress = (now - startTime) / duration;
                
                if (progress > 1) {{
                    busMarker.setLatLng(endLatLng);
                    busMarker._icon.style.transform += ` rotate(${{angle}}deg)`;
                    if (currentIdx < points.length - 1) {{
                        setTimeout(animateBus, 200);
                    }}
                }} else {{
                    var lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
                    var lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;
                    busMarker.setLatLng([lat, lng]);
                    busMarker._icon.style.transform += ` rotate(${{angle}}deg)`;
                    requestAnimationFrame(animate);
                }}
            }}
            
            animate();
        }}
    }}
    
    // 애니메이션 시작
    setTimeout(animateBus, 1000);
"""

# JavaScript 코드를 지도에 추가
m.get_root().script.add_child(folium.Element(js_code))

# 지도 저장
m.save("route_map.html")
print("지도 파일이 'route_map.html'로 저장되었습니다.")
