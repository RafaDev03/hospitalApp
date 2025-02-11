import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment } from '../../environments/environment.development';
import { LoginForm } from '../interfaces/login-form.interface';
import { Observable, catchError, delay, map, of, tap } from 'rxjs';
import { UpdateForm } from '../interfaces/update-form.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user?: User;

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get role(): 'ADMIN_ROLE' | 'USER_ROLE' {
    return this.user?.role!;
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token,
      },
    };
  }

  constructor(private http: HttpClient) {}

  createUser(formData: RegisterForm) {
    return this.http.post(`${baseUrl}/users`, formData).pipe(
      tap((res: any) => {
        this.saveLocalStorage(res.token, res.menu);
      })
    );
  }

  loginUser(formData: LoginForm) {
    return this.http.post(`${baseUrl}/login`, formData).pipe(
      tap((resp: any) => {
        this.saveLocalStorage(resp.token, resp.menu);
      })
    );
  }

  validToken(): Observable<boolean> {
    const token = this.token;
    return this.http
      .get(`${baseUrl}/login/renew`, {
        headers: {
          'x-token': token,
        },
      })
      .pipe(
        map((res: any) => {
          const { email, google, id, img, name, role } = res.user;
          this.user = new User(name, email, '', img, google, role, id);
          this.saveLocalStorage(res.token, res.menu);
          return true;
        }),
        catchError(() => of(false))
      );
  }

  updateUser(formData: UpdateForm) {
    return this.http.put(
      `${baseUrl}/users/${this.user?.id}`,
      formData,
      this.headers
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('menu');
  }

  findUsers(desde: number) {
    const url = `${baseUrl}/users?desde=${desde}`;
    return this.http.get(url, this.headers).pipe(
      map((res: any) => {
        const users = res.users.map(
          (user: any) =>
            new User(
              user.name,
              user.email,
              '',
              user.img,
              user.google,
              user.role,
              user.id
            )
        );
        return {
          count: res.count,
          users,
        };
      })
    );
  }

  deleteUsers(id: string) {
    const url = `${baseUrl}/users/${id}`;
    return this.http.delete(url, this.headers);
  }

  saveUser(user: User) {
    const url = `${baseUrl}/users/${user.id}`;
    return this.http.put(url, user, this.headers);
  }

  saveLocalStorage(token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }
}
