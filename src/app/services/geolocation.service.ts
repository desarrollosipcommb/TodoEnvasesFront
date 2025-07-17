
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}



  getCurrentPosition(): Promise<GeolocationPosition> {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            resolve(position);
          },
          (error: GeolocationPositionError) => {
            reject(error);
          },
          options
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }
}
