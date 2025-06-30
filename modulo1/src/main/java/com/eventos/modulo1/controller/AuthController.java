package com.eventos.modulo1.controller;

import com.eventos.modulo1.model.User;
import com.eventos.modulo1.repository.UserRepository;
import com.eventos.modulo1.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")  // libera acesso do frontend React
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        User user = userRepository.findByEmail(request.get("email"))
                .orElse(null);
        if (user == null || !passwordEncoder.matches(request.get("password"), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String header) {
        try {
            String token = header.replace("Bearer ", "");
            Claims claims = jwtService.validateToken(token);
            return ResponseEntity.ok(Map.of(
                "isValid", true,
                "email", claims.getSubject(),
                "name", claims.get("name")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("isValid", false));
        }
    }
    
    @RestController
    public class HomeController {
    @GetMapping("/")
    public String home() {
        return "Backend Spring Boot rodando!";
    }

    @GetMapping("/api")
    public String apiHome() {
        return "API de autenticação disponível em /api/register, /api/login, /api/validate-token";
    }
   }
   

}
