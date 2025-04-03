# python3 ./watchtower_test.py --messages '개별로 카톡 보내기 테스트' --receiver 'iron.man1011
# ,gunn.kim' 

# python3 ./katalk.py --messages '개별로 카톡 보내기 테스트' --receiver 'gunn.kim' 

import argparse
import requests

def main(args):
    messages = args.messages
    receiver = args.receiver.split(" ")  # 쉼표로 구분된 문자열을 리스트로 변환

    results = []
    res = messages.split("<br/>")  # 메시지를 <br/>로 분리

    url_root = 'http://api.noti.daumkakao.io/send/personal/kakaotalk'

    for user in receiver:
        for msg in res:
            # 각 요청에 메시지, 수신자, API ID 추가
            results.append(requests.get(url_root, params={'to': user, 'msg': msg.strip('\n')}))
    print(results)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--messages', type=str, required=True)
    parser.add_argument('--receiver', type=str, required=True)
    args = parser.parse_args()

    main(args)