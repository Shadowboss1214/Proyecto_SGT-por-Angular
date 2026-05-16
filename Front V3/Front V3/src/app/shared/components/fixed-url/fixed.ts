import { Injectable } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';

@Injectable()
export class FixedLocationStrategy extends PathLocationStrategy {

  private internalUrl = '/Bus.inc.com'; 

  override path(): string {
    return this.internalUrl; 
  }

  override pushState(state: any, title: string, url: string, queryParams: string): void {
    this.internalUrl = url;                         
    sessionStorage.setItem('last_route', url);     
    super.pushState(state, title, '/Bus.inc.com', '');     
  }

  override replaceState(state: any, title: string, url: string, queryParams: string): void {
    this.internalUrl = url;                     
    sessionStorage.setItem('last_route', url);     
    super.replaceState(state, title, '/Bus.inc.com', '');   
  }
}
