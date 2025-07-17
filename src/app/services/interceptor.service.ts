import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { TokenService } from './token/token.service';
import { Config } from '../config/config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor{
  public isLogged=false;

  constructor(private tokenService: TokenService,private config:Config, private router:Router) { }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let autReq= req;
    const token= this.tokenService.getToken();
    if (token!=null) {
      autReq= req.clone({
        setHeaders:{
          Authorization: `Bearer ${token}`
        },
      });      
    }
    return next.handle(autReq).pipe(
      catchError((err:HttpErrorResponse)=>{
        //Si el error es 401, quiere decir que el token no es valido
        if (err.status===401) {
         this.router.navigateByUrl('/');
         this.config.setRoles([]);
         this.config.setDisplayName('');
         sessionStorage.clear(); 
         this.isLoggedIn();
         sessionStorage.clear();       
        }
        return throwError(err);
      })
    )
    //throw new Error('Method not implemented.');
  }


    async isLoggedIn(){
    if(this.tokenService.getToken()){
      this.isLogged=true;    
      this.config.setIsLogged(this.isLogged);    
    }else{      
      this.isLogged=false;  
      this.router.navigateByUrl('/');
      this.config.setIsLogged(this.isLogged);  
    }
  }
}
export const interceptorProvider=[{provide: HTTP_INTERCEPTORS, useClass:InterceptorService, multi: true}];
