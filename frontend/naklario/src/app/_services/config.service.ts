import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConfig } from '../_models';

@Injectable()
export class ConfigService {
    private static configSub: ReplaySubject<AppConfig> = new ReplaySubject(1);
    static config$: Observable<AppConfig> = ConfigService.configSub.asObservable();

    constructor(private http: HttpClient) {}

    load() {
        const configName = environment.production ? 'prod' : 'dev';
        const jsonFile = `assets/config/config.${configName}.json`;
        console.log('load started');
        return this.http.get<AppConfig>(jsonFile).pipe(tap(ConfigService.configSub.next));
    }
}
