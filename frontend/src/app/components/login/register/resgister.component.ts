import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Se já estiver logado, redirecionar para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const userData: RegisterRequest = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = 'Cadastro realizado com sucesso! Redirecionando para login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message || 'Erro no cadastro';
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.error?.errors) {
            // Mostrar erros de validação
            const errors = error.error.errors;
            const errorMessages = Object.keys(errors).map(key => 
              errors[key][0]
            ).join(', ');
            this.error = errorMessages;
          } else {
            this.error = error.error?.message || 'Erro de conexão';
          }
          console.error('Register error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Validador customizado para confirmar senha
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Getters para facilitar o acesso aos campos no template
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }
  get role() { return this.registerForm.get('role'); }
  get passwordMismatch() { return this.registerForm.errors?.['passwordMismatch']; }
}