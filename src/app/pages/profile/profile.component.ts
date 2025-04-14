
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  updateSuccess = false;
  updateError = '';

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.initForm();
    });
  }

  initForm(): void {
    if (!this.user) return;

    this.profileForm = this.formBuilder.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      profileImage: [this.user.profileImage || '']
    });
  }

  onSubmit(): void {
    if (!this.user || this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.updateSuccess = false;
    this.updateError = '';

    const updatedUser: User = {
      ...this.user,
      ...this.profileForm.value
    };

    this.authService.updateProfile(updatedUser).subscribe({
      next: () => {
        this.isLoading = false;
        this.updateSuccess = true;
        setTimeout(() => this.updateSuccess = false, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.updateError = error.message || 'Failed to update profile';
      }
    });
  }

  onCancel(): void {
    this.initForm();
  }

  get f() {
    return this.profileForm.controls;
  }
}
