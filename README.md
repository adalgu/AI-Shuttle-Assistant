![image](https://github.com/user-attachments/assets/653aa5af-9e0e-4dbc-864b-67494ff9dd0d)

# AI Shuttle Assistant: Safe Ride for Kids

AgenticRide is an AI-powered shuttle bus management system developed by Team AZ2. The system assists shuttle bus drivers with real-time student management, route optimization, and parent communication.

## 🚀 Key Features

### 🎯 Real-time Student Management

- Track student boarding status (waiting/boarded/absent)
- Manage pickup lists and locations
- Real-time status updates with automatic parent notifications

### 🗺️ Smart Route Optimization

- Multi-stop route calculation
- Real-time route adjustments based on student attendance
- Dynamic route visualization with pickup locations
- Traffic-aware routing system

### 📱 Automated Communication

- Instant KakaoTalk notifications to parents
- Slack integration for system updates
- Automated weather alerts and delay notifications
- Real-time status broadcasting

### 🌤️ Environmental Awareness

- Real-time weather monitoring
- Location-based weather alerts
- Proactive parent notifications for weather-related preparations

### 🎨 Interactive UI Components

- Interactive map visualization
- Real-time student list display
- Message history tracking
- AI assistant activation button

## 🛠️ Technical Stack

<img width="754" alt="image" src="https://github.com/user-attachments/assets/7d01db47-f15c-4968-952e-c7cd7529e41e" />

### Frontend

- React with TypeScript
- Interactive map integration (Kakao Maps API)
- Real-time state management
- WebSocket-based communication

### Backend

- Node.js relay server
- Slack Socket Mode for real-time messaging
- OpenAI GPT-4 integration
- Environment-based configuration

### Communication APIs

- KakaoTalk Messaging API
- Slack Web API & Socket Mode
- OpenAI Chat Completions API

## 🔧 Core Components

### 1. Main Application

- **System Tools**

  - Memory management
  - Canvas visualization
  - Weather monitoring
  - Music canvas integration

- **Communication Tools**

  - KakaoTalk messaging
  - Slack notifications
  - Parent communication management

- **Location Services**

  - Address to coordinates conversion
  - Multi-stop route optimization
  - Real-time location tracking

- **Student Management**
  - Student list management
  - Status updates
  - Attendance tracking
  - Parent notification system

### 2. Relay Server

The relay server enables bidirectional communication between the system and Slack, powered by GPT-4:

- **Features**

  - Real-time Slack message processing
  - Conversation history management
  - Automatic reconnection handling
  - Environment-based configuration
  - Custom AI instructions for shuttle service

- **Technical Details**
  - Socket Mode for real-time Slack events
  - GPT-4 powered responses
  - Conversation context maintenance
  - Error handling and logging
  - Secure token management

## 🌟 Key Workflows

### Student Pickup Process

1. Initialize student pickup list
2. Calculate optimal route
3. Track real-time boarding status
4. Send automated notifications to parents
5. Update route based on attendance changes

### Communication Flow

1. Real-time status updates to parents via KakaoTalk
2. System status broadcasts through Slack
3. Automated weather and traffic alerts
4. Delay notifications and status updates
5. AI-powered responses to inquiries

### Route Management

1. Initial route calculation based on student addresses
2. Real-time route adjustments for absences
3. Traffic-aware route optimization
4. Dynamic visualization of current route and stops

## 🤖 AI Assistant Features

- Voice command support for drivers
- Automated message drafting
- Intelligent situation analysis
- Weather-based notifications
- Traffic-aware route suggestions
- Real-time decision support
- Context-aware Slack responses

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed with ❤️ by Team AZ2
