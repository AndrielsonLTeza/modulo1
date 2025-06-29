import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class Dashboard Component implements OnInit {
  currentUser: User | null = null;
  token: string | null = null;
  tokenValidation: any = null;
  showToken = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.token = this.authService.token;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.validateCurrentToken();
  }

  validateCurrentToken() {
    this.authService.validateToken().subscribe({
      next: (response) => {
        this.tokenValidation = response;
      },
      error: (error) => {
        console.error('Token validation failed:', error);
        this.tokenValidation = { isValid: false, message: 'Token inválido' };
      }
    });
  }

  refreshToken() {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        if (response.success) {
          this.token = this.authService.token;
          this.validateCurrentToken();
          alert('Token renovado com sucesso!');
        }
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        alert('Erro ao renovar token');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  toggleToken() {
    this.showToken = !this.showToken;
  }

  copyToken() {
    if (this.token) {
      navigator.clipboard.writeText(this.token).then(() => {
        alert('Token copiado para a área de transferência!');
      });
    }
  }

  getUserTypeLabel(userType: string): string {
    const types: { [key: string]: string } = {
      'student': 'Estudante',
      'teacher': 'Professor',
      'admin': 'Administrador'
    };
    return types[userType] || userType;
  }
}