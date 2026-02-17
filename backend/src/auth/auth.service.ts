import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: number;
  username: string;
  password: string;
  name: string;
}

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    { id: 1, username: 'demo', password: 'wagerkit2024', name: 'Demo User' },
    { id: 2, username: 'admin', password: 'admin123', name: 'Admin' },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, name: user.name },
    };
  }
}
