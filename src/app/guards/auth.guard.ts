import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.validToken().pipe(
    tap((isValid) => {
      if (!isValid) {
        router.navigate(['/auth']);
      }
    })
  );
};
