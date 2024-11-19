import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
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
import { Operation } from 'fast-json-patch';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { ItemDataService } from '../../core/data/item-data.service';
import { Item } from '../../core/shared/item.model';
import { PatchRequest } from '../../core/data/request.models';

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
  @ViewChild('ng18sub')
  ng18sub: ElementRef;

  protected subs: Subscription[] = [];

  wsiRd$: BehaviorSubject<RemoteData<WorkspaceItem>> = new BehaviorSubject(undefined);
  itemRd$: BehaviorSubject<RemoteData<Item>> = new BehaviorSubject(undefined);
  sectionRd$: BehaviorSubject<RemoteData<SubmissionFormModel>> = new BehaviorSubject(undefined);
  model$: BehaviorSubject<SubmissionFormModel> = new BehaviorSubject(undefined);

  constructor(
    protected route: ActivatedRoute,
    protected hrefOnlyDataService: HrefOnlyDataService,
    protected wsiDataService: WorkspaceitemDataService,
    protected itemDataService: ItemDataService,
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

    this.subs.push(this.wsiRd$.pipe(
      switchMap((wsiRd: RemoteData<WorkspaceItem>) => {
        if (wsiRd.hasSucceeded) {
          return this.itemDataService.findByHref(wsiRd.payload._links.item.href);
        } else {
          return [wsiRd]
        }
      }),
    ).subscribe((itemRd: RemoteData<Item>) => {
      this.itemRd$.next(itemRd);
    }));

    //Todo we should get this by following links from the wsi, but that doesn't work on the backend, so it's a hardcoded link for now:
    this.subs.push(this.hrefOnlyDataService.findByHref<SubmissionFormModel>(
      new RESTURLCombiner('/config/submissionforms/publicationStep').toString()
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

    document.addEventListener('ng18-submission-loaded', () => {
      const ng18sub: any = document.getElementsByTagName('ng18-submission')[0];
      this.subs.push(
        this.model$.pipe(
          hasValueOperator()
        ).subscribe((model: SubmissionFormModel) => {
          ng18sub.model = model;
        })
      );
      this.subs.push(
        this.wsiRd$.pipe(
          getAllSucceededRemoteDataPayload()
        ).subscribe((wsi: WorkspaceItem) => {
          ng18sub.wsi = wsi;
        })
      );
    })
  }

  // The type here is CustomEvent, because the patch gets wrapped in one, due to angular elements
  onSubmit(event: CustomEvent) {
    const patch = event.detail;
    const requestId = this.requestService.generateRequestId();
    const request = new PatchRequest(requestId, this.wsiRd$.getValue().payload.self, patch);
    this.requestService.send(request);
  }

}
