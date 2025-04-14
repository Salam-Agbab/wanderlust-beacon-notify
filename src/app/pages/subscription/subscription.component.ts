
import { Component, OnInit } from '@angular/core';
import { PaymentService, SubscriptionPlan, PaymentMethod } from '../../services/payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  subscriptionPlans: SubscriptionPlan[] = [];
  currentPlan: SubscriptionPlan | null = null;
  paymentMethods: PaymentMethod[] = [];
  
  showPaymentModal = false;
  paymentForm!: FormGroup;
  isProcessing = false;
  subscriptionSuccess = false;
  selectedPlanId: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.paymentService.getSubscriptionPlans().subscribe(plans => {
      this.subscriptionPlans = plans;
    });
    
    this.paymentService.getCurrentPlan().subscribe(plan => {
      this.currentPlan = plan;
    });
    
    this.paymentService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });
    
    this.initPaymentForm();
  }

  initPaymentForm(): void {
    this.paymentForm = this.formBuilder.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      saveCard: [true]
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    if (this.currentPlan?.id === plan.id) {
      return; // Already on this plan
    }
    
    this.selectedPlanId = plan.id;
    
    if (plan.price > 0 && this.paymentMethods.length === 0) {
      // Need to collect payment info
      this.showPaymentModal = true;
    } else {
      // Can use existing payment method
      this.subscribeToPlan(plan.id);
    }
  }

  subscribeToPlan(planId: string): void {
    this.isProcessing = true;
    this.paymentService.subscribeToPlan(planId).subscribe({
      next: () => {
        this.isProcessing = false;
        this.subscriptionSuccess = true;
        this.showPaymentModal = false;
        
        // Reset after 3 seconds
        setTimeout(() => {
          this.subscriptionSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Subscription error:', error);
        this.isProcessing = false;
      }
    });
  }

  submitPaymentForm(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    
    this.isProcessing = true;
    
    // Simulate adding a payment method
    const { cardholderName, cardNumber, expiryDate } = this.paymentForm.value;
    
    this.paymentService.addPaymentMethod({
      type: 'card',
      last4: cardNumber.slice(-4),
      expiryDate: expiryDate,
      cardType: 'Visa', // In a real app, we would determine this from the card number
      isDefault: true
    }).subscribe({
      next: () => {
        if (this.selectedPlanId) {
          this.subscribeToPlan(this.selectedPlanId);
        } else {
          this.isProcessing = false;
          this.showPaymentModal = false;
        }
      },
      error: (error) => {
        console.error('Payment method error:', error);
        this.isProcessing = false;
      }
    });
  }

  closePaymentModal(): void {
    if (!this.isProcessing) {
      this.showPaymentModal = false;
      this.selectedPlanId = null;
    }
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2);
  }

  isPlanActive(planId: string): boolean {
    return this.currentPlan?.id === planId;
  }
}
