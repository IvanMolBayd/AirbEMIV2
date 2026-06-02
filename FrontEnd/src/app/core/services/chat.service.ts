import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  type: 'text' | 'property';
  property?: any;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/chatbot';

  ask(question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ask`, { question });
  }
}
