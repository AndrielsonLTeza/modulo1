<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthController extends Controller
{
    /**
     * Registrar novo usuário
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'in:admin,user'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
            'email_verified_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuário registrado com sucesso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]
        ], 201);
    }

    /**
     * Login do usuário
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        $token = $this->generateJWT($user);

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Validar token JWT (endpoint para outros microserviços)
     */
    public function validateToken(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token não fornecido'
                ], 401);
            }

            $decoded = JWT::decode($token, new Key(config('jwt.secret'), 'HS256'));
            
            $user = User::find($decoded->user_id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token válido',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role
                    ],
                    'token_data' => [
                        'user_id' => $decoded->user_id,
                        'email' => $decoded->email,
                        'role' => $decoded->role,
                        'exp' => $decoded->exp,
                        'iat' => $decoded->iat
                    ]
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido',
                'error' => $e->getMessage()
            ], 401);
        }
    }

    /**
     * Logout do usuário
     */
    public function logout(Request $request)
    {
        // Em uma implementação real, você adicionaria o token em uma blacklist
        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    /**
     * Obter perfil do usuário autenticado
     */
    public function profile(Request $request)
    {
        $user = $request->user;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ]
            ]
        ]);
    }

    /**
     * Resetar senha (simulado)
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email inválido',
                'errors' => $validator->errors()
            ], 422);
        }

        $resetToken = Str::random(60);
        
        // Em uma implementação real, você salvaria o token no banco
        // e enviaria por email
        
        return response()->json([
            'success' => true,
            'message' => 'Link de recuperação enviado para o email',
            'data' => [
                'reset_token' => $resetToken, // Apenas para teste
                'reset_url' => url("/password/reset/{$resetToken}")
            ]
        ]);
    }

    /**
     * Gerar JWT Token
     */
    private function generateJWT($user)
    {
        $payload = [
            'iss' => config('app.url'),
            'sub' => 'auth-service',
            'aud' => 'eventos-universitarios',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24), // 24 horas
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role
        ];

        return JWT::encode($payload, config('jwt.secret'), 'HS256');
    }
}