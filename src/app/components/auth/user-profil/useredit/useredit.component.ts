import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/models/customer';
import { PasswordChangeModel } from 'src/app/models/passwordChangeModel';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-useredit',
  templateUrl: './useredit.component.html',
  styleUrls: ['./useredit.component.css']
})
export class UsereditComponent implements OnInit {

  passwordUpdateForm: UntypedFormGroup;
  userForm: UntypedFormGroup;
  customerForm: UntypedFormGroup;
  user: User;
  customer: Customer;
  constructor(
    private formBuilder:UntypedFormBuilder,
    private toastrService: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.createPasswordUpdateForm();
  }

  createPasswordUpdateForm(){
    this.passwordUpdateForm = this.formBuilder.group({
      oldPassword: ["", Validators.required],
      newPassword: ["", Validators.required],
    })
  }

  updatepassord(){
    if(this.passwordUpdateForm.valid){
      this.passwordUpdateForm.addControl("userId",new UntypedFormControl(this.authService.getCurrentUserId()))
      let passwordModel:PasswordChangeModel = Object.assign({},this.passwordUpdateForm.value)
      this.authService.changePassword(passwordModel).subscribe(response => {
        this.toastrService.success(response.message,"Successful")
      },responseError => {
        this.toastrService.error(responseError.error.message,"Error")

      })
    }else{
      this.toastrService.error("You must fill in all fields","Error")
    }
  }

}
