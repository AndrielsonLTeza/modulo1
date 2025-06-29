import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    token_type: string;
  };
  errors?: any;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar se há um usuário salvo no localStorage
    this.loadUserFromStorage();
  }

  /**
   * Registrar novo usuário
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData);
  }

  /**
   * Login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data.user, response.data.token);
          }
        })
      );
  }

  /**
   * Logout do usuário
   */
  logout(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  /**
   * Obter perfil do usuário
   */
  getProfile(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/profile`, { headers });
  }

  /**
   * Validar token (usado por outros microserviços)
   */
  validateToken(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/validate-token`, {}, { headers });
  }

  /**
   * Reset de senha
   */
  resetPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/reset-password`, { email });
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obter token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Verificar se o usuário é admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Obter headers de autenticação
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Salvar dados de autenticação
   */
  private setAuthData(user: User, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Limpar dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Carregar usuário do localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }
}