import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { RemoteData } from '../../core/data/remote-data';
import { WorkspaceItem } from '../../core/submission/models/workspaceitem.model';
import { SubmissionFormModel } from '../../core/config/models/config-submission-form.model';
import { ActivatedRoute } from '@angular/router';
import { HrefOnlyDataService } from '../../core/data/href-only-data.service';
import { WorkspaceitemDataService } from '../../core/submission/workspaceitem-data.service';
import { RequestService } from '../../core/data/request.service';
import { map, switchMap } from 'rxjs/operators';
import {
  getFirstCompletedRemoteData,
  getAllSucceededRemoteDataPayload
} from '../../core/shared/operators';
import { RESTURLCombiner } from '../../core/url-combiner/rest-url-combiner';
import { hasValueOperator } from '../../shared/empty.util';
import { AsyncPipe } from '@angular/common';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';

@Component({
  selector: 'ds-submission-page',
  standalone: true,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    AsyncPipe,
    ThemedLoadingComponent
  ],
  templateUrl: './submission-page.component.html',
  styleUrl: './submission-page.component.scss'
})
export class SubmissionPageComponent {
  protected subs: Subscription[] = [];

  wsiRd$: BehaviorSubject<RemoteData<WorkspaceItem>> = new BehaviorSubject(undefined);
  sectionRd$: BehaviorSubject<RemoteData<SubmissionFormModel>> = new BehaviorSubject(undefined);
  model$: BehaviorSubject<SubmissionFormModel> = new BehaviorSubject(undefined);

  constructor(
    protected route: ActivatedRoute,
    protected hrefOnlyDataService: HrefOnlyDataService,
    protected wsiDataService: WorkspaceitemDataService,
    protected requestService: RequestService,
  ) {
  }

  ngOnInit(): void {
    this.subs.push(this.route.data.pipe(
      map((data: any) => data.wsi),
      getFirstCompletedRemoteData(),
      switchMap((wsiRd: RemoteData<WorkspaceItem>) => {
        if (wsiRd.hasSucceeded) {
          return this.wsiDataService.findById(wsiRd.payload.id);
        } else {
          return [wsiRd];
        }
      })
    ).subscribe((wsiRd: RemoteData<WorkspaceItem>) => this.wsiRd$.next(wsiRd)));

    //Todo we should get this by following links from the wsi, but that doesn't work on the backend, so it's a hardcoded link for now:
    this.subs.push(this.hrefOnlyDataService.findByHref<SubmissionFormModel>(
      new RESTURLCombiner('/config/submissionforms/traditionalpageone').toString()
    ).subscribe((formRd: RemoteData<SubmissionFormModel>) => {
      this.sectionRd$.next(formRd);
    }));

    this.subs.push(
      this.sectionRd$.pipe(
        hasValueOperator(),
        getAllSucceededRemoteDataPayload()
      ).subscribe((model: SubmissionFormModel) => {
        this.model$.next(model);
      })
    );

    this.model$.subscribe((t) => {console.log('this.model$', t)});
  }
}
