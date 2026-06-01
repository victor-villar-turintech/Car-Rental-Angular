import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup,FormControl,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: UntypedFormGroup;
  submitted:boolean = false;
  dataLoaded:boolean = false;
  constructor(
    private  formBuilder:UntypedFormBuilder,
    private authService:AuthService,
    private toasterService:ToastrService,
  ) { }

  get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    this.createLoginForm();
  }
  createLoginForm(){
    this.registerForm=this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }
  register(){
    if(this.registerForm.valid){
      let registerModel =Object.assign({},this.registerForm.value)
        this.authService.register(registerModel).subscribe(response=>{
        this.toasterService.success(response.message,"Successful")
        this.dataLoaded=true
        
      }
      ,responseError=>{
       
        if(responseError.error.ValidationErrors.length > 0) {
         
          this.toasterService.error(responseError.error,"Error!")
        }
        
      })
    }
     else {
      this.toasterService.error("Please fill in all fields","Warning!")
    }
  }
}
