import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  async ask(@Body('question') question: string) {
    if (!question) return { answer: "Que puis-je faire pour vous ?" };
    return this.chatbotService.handleQuery(question);
  }
}
