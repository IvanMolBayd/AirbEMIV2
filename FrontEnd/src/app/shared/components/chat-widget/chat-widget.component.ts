import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-widget.component.html'
})
export class ChatWidgetComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  private chatService = inject(ChatService);

  isOpen = signal(false);
  isTyping = signal(false);
  userInput = '';
  
  messages = signal<ChatMessage[]>([
    { 
      id: '1', 
      sender: 'bot', 
      content: 'Bonjour ! Je suis l\'assistant intelligent d\'AirBEMI. Je peux répondre à vos questions ou vous aider à trouver le logement de vos rêves. Que puis-je faire pour vous ?',
      type: 'text'
    }
  ]);

  suggestions = [
    'Chercher une villa à Marrakech',
    'Logement avec piscine et wifi',
    'Trouve moi un Riad',
    'Voir mes réservations'
  ];

  sendSuggestion(suggestion: string) {
    this.userInput = suggestion;
    this.sendMessage();
  }

  toggleChat() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  ngAfterViewChecked() {
    // Scroll auto (peut être optimisé pour ne scroller que si on est en bas)
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: this.userInput.trim(),
      type: 'text'
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    const query = this.userInput;
    this.userInput = '';
    this.isTyping.set(true);
    setTimeout(() => this.scrollToBottom(), 50);

    this.chatService.ask(query).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          content: res.answer,
          type: res.type || 'text',
          property: res.property
        };
        this.messages.update(msgs => [...msgs, botMsg]);
        this.isTyping.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          content: "Désolé, je n'ai pas pu joindre mon cerveau IA. Réessayez plus tard !",
          type: 'text'
        };
        this.messages.update(msgs => [...msgs, botMsg]);
        this.isTyping.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }
}
