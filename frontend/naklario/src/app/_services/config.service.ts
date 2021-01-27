import { HttpBackend, HttpClient, HttpHandler } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable, Optional } from '@angular/core';
import { of, ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { BootstrapConfig, AppConfig } from '../_models/config';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private bootstrapConfig$ = new ReplaySubject<BootstrapConfig>(1);
    private http: HttpClient;

    constructor(httpHandler: HttpBackend, @Optional() @Inject(REQUEST) protected request: Request,
    ) {
        this.http = new HttpClient(httpHandler);
    }

    public getSettings() {
        return new Promise<void>((resolve, reject) => {
            let configJSON = '/assets/config/bootstrapConfig.json';
            if (this.request?.headers?.referer) {
                configJSON = this.request.headers.referer + configJSON;
            }
            this.http
                .get<BootstrapConfig>(
                    configJSON
                )
                .pipe(
                    switchMap((bootstrapSettings) => {
                        if (bootstrapSettings.fetchSettingsFromAPI) {
                            return this.http
                                .get<AppConfig>(bootstrapSettings.apiUrl + '/settings/')
                                .pipe(
                                    map((settings) =>
                                        Object.assign(bootstrapSettings, { appSettings: settings })
                                    )
                                );
                        }
                        return of(bootstrapSettings);
                    })
                )
                .toPromise()
                .then((settings) => {
                    console.log('got settings', settings);
                    this.bootstrapConfig$.next(settings);
                    this.bootstrapConfig$.complete();
                    resolve();
                });
        });
    }

    public get apiURL() {
        return this.bootstrapConfig$.pipe(map(x => x.apiUrl));
    }

    public get features() {
        return this.bootstrapConfig$.pipe((map(x => x.appSettings.features)));
    }

    public get settings() {
        return this.bootstrapConfig$.pipe((map(x => x.appSettings)));
    }
}
