
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'admin' | 'user';
  subscriptionType?: 'free' | 'basic' | 'premium';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private loggedInSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor() {
    // Check if user is already logged in from local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.loggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<User> {
    // This is a mock implementation - in a real app, this would call an API
    // For demo purposes, we're accepting any login with valid format
    if (email && password && email.includes('@') && password.length >= 6) {
      const user: User = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        profileImage: 'https://i.pravatar.cc/150?u=' + email,
        role: 'user',
        subscriptionType: 'free'
      };

      return of(user).pipe(
        delay(1000), // Simulate network delay
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.loggedInSubject.next(true);
        })
      );
    } else {
      throw new Error('Invalid email or password');
    }
  }

  register(name: string, email: string, password: string): Observable<User> {
    // This is a mock implementation - in a real app, this would call an API
    if (name && email && password && email.includes('@') && password.length >= 6) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        profileImage: 'https://i.pravatar.cc/150?u=' + email,
        role: 'user',
        subscriptionType: 'free'
      };

      return of(user).pipe(
        delay(1000), // Simulate network delay
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.loggedInSubject.next(true);
        })
      );
    } else {
      throw new Error('Invalid registration information');
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.loggedInSubject.next(false);
  }

  updateProfile(user: User): Observable<User> {
    return of(user).pipe(
      delay(1000), // Simulate network delay
      tap(updatedUser => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  updateSubscription(type: 'free' | 'basic' | 'premium'): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        subscriptionType: type
      };
      
      return of(updatedUser).pipe(
        delay(1000), // Simulate network delay
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
    }
    throw new Error('No user logged in');
  }
}
