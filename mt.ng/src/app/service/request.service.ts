import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NEVER, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RequestService {
    public constructor(private http: HttpClient) {}

    public getRequest<T>(url: string): Observable<T> {
        return this.http.get<T>(url).pipe(catchError((error, caught) => this.handleError(error)));
    }

    public postRequest<T>(url: string, body: string): Observable<T> {
        return this.http.post<T>(url, body, this.getHeaders()).pipe(catchError((error, caught) => this.handleError(error)));
    }

    public deleteRequest<T>(url: string): Observable<T> {
        return this.http.delete<T>(url).pipe(catchError((error, caught) => this.handleError(error)));
    }

    private handleError(error: any): Observable<never> {
        console.log('request error', error);
        return NEVER;
    }

    private getHeaders(): { headers: HttpHeaders } {
        return { headers: new HttpHeaders().set('Content-type', 'application/json; charset=utf-8') };
    }
}
