import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_PAR_DEFAUT_A_CHANGER_EN_PROD', // Idéalement via ConfigModule
    });
  }

  async validate(payload: any) {
    // Ce qui est retourné ici sera accessible via req.user dans les routes protégées
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
