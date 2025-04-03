import 'dotenv/config';
import { WebClient } from '@slack/web-api';
import { SocketModeClient } from '@slack/socket-mode';
import OpenAI from 'openai';

// 환경변수 확인
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
if (!SLACK_APP_TOKEN) {
  throw new Error('SLACK_APP_TOKEN environment variable is required');
}

// Slack 클라이언트 초기화
const slack = SLACK_BOT_TOKEN ? new WebClient(SLACK_BOT_TOKEN) : null;
const socketModeClient = new SocketModeClient({
  appToken: SLACK_APP_TOKEN,
  logLevel: 'debug',
  clientPingTimeout: 30000, // ping timeout을 30초로 증가
  serverPongTimeout: 30000, // pong timeout을 30초로 증가
});

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// 채널별 대화 기록 저장
const conversationHistories = new Map();

// 대화 기록 관리 함수
function getConversationHistory(channelId) {
  if (!conversationHistories.has(channelId)) {
    // conversation_config.js의 instructions를 사용
    const instructions = `당신은 AI-Shuttle 서비스의 기사입니다. 승객들의 질문에 친절하게 답변해주세요. 
    학원 셔틀버스 운행과 관련된 모든 업무를 지원하며, 학생 픽업/탑승 상태 관리, 학부모 메시지 전송, 
    경로 최적화, 교통/날씨 정보 제공, 실시간 상황에 맞는 안내 메시지 제안 등을 수행합니다.`;

    conversationHistories.set(channelId, [
      { role: 'system', content: instructions },
    ]);
  }
  return conversationHistories.get(channelId);
}

// OpenAI API를 사용한 메시지 처리
async function processMessage(channelId, text) {
  const history = getConversationHistory(channelId);
  history.push({ role: 'user', content: text });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: history,
      temperature: 0.7,
    });

    const response = completion.choices[0].message;
    history.push(response);

    // 히스토리 크기 제한 (최근 10개 메시지만 유지)
    if (history.length > 11) {
      // system 메시지 + 최근 10개
      history.splice(1, history.length - 11);
    }

    return response.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// 이벤트 처리 함수
async function handleEvent(event) {
  console.log('Processing event:', JSON.stringify(event, null, 2));

  // 메시지 이벤트 처리
  if (event.type === 'message' && !event.bot_id && event.text) {
    try {
      console.log('Processing message:', event.text);
      const response = await processMessage(event.channel, event.text);

      if (response && slack) {
        console.log('Sending response:', response);
        await slack.chat.postMessage({
          channel: event.channel,
          text: response,
          icon_emoji: ':bus:',
        });
      }
    } catch (error) {
      console.error('Message processing error:', error);
    }
  }
}

// Socket Mode 이벤트 처리
socketModeClient.on('message', async ({ event, body, ack }) => {
  await ack();
  await handleEvent(event);
});

// 모든 이벤트 처리
socketModeClient.on('slack_event', async ({ event, body, ack }) => {
  await ack();
  await handleEvent(event);
});

// 연결 및 에러 처리
(async () => {
  try {
    await socketModeClient.start();
    console.log('⚡️ Slack Socket Mode client is running!');
  } catch (error) {
    console.error('Failed to start Socket Mode client:', error);
    process.exit(1);
  }
})();

// 에러 이벤트 처리
socketModeClient.on('error', (error) => {
  console.error('Socket Mode client error:', error);
});

// 연결 해제 이벤트 처리
socketModeClient.on('disconnect', () => {
  console.log('Disconnected from Slack. Attempting to reconnect...');
});

// 재연결 이벤트 처리
socketModeClient.on('reconnect', () => {
  console.log('Reconnected to Slack');
});

// 핑/퐁 디버깅
socketModeClient.on('ping', () => {
  console.log('Ping received from Slack');
});

socketModeClient.on('pong', () => {
  console.log('Pong received from Slack');
});
