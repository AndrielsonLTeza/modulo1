import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = false;
  error = '';
  tokenValidation = {
    loading: false,
    result: null as any,
    error: ''
  };

  // Exemplo de token para testes dos outros módulos
  sampleToken = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadProfile();
    this.generateSampleToken();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.authService.getProfile().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.currentUser = response.data.user;
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Erro ao carregar perfil';
        console.error('Profile error:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Mesmo com erro, fazer logout local
        this.router.navigate(['/login']);
      }
    });
  }

  testTokenValidation(): void {
    this.tokenValidation.loading = true;
    this.tokenValidation.error = '';
    this.tokenValidation.result = null;

    this.authService.validateToken().subscribe({
      next: (response) => {
        this.tokenValidation.loading = false;
        this.tokenValidation.result = response;
      },
      error: (error) => {
        this.tokenValidation.loading = false;
        this.tokenValidation.error = error.error?.message || 'Erro na validação';
        this.tokenValidation.result = error.error;
      }
    });
  }

  private generateSampleToken(): void {
    this.sampleToken = this.authService.getToken() || '';
  }

  copyToken(): void {
    navigator.clipboard.writeText(this.sampleToken).then(() => {
      alert('Token copiado para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar token');
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}