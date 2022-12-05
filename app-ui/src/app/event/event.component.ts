import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../services/user.service';
import { EventsService } from '../services/events.service';
import { TokenUser } from '../token-user';
import { ErrorHandleService } from '../services/error-handle.service';
import { FormHelperService } from '../services/form-helper.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html'
})
export class EventComponent implements OnInit, OnDestroy {
  @ViewChild('buyGiftModal') buyGiftModal;
  @ViewChild('deleteGiftModal') deleteGiftModal;
  @ViewChild('commentGiftModal') commentGiftModal;
  public user: TokenUser;
  private _userSubscription: Subscription;
  public event: Object;
  public gifts: Object[];
  public hasComments: Map<string, boolean> = new Map<string, boolean>();
  public participants: Object[];
  public comments: Object[];
  public giftToComment: Object;
  public loadingEvent;
  public error: any;
  public giftToBuy: Object;
  public giftToBuyNewStatus: string;
  addParticipantForm: FormGroup;
  deleteGiftId: number;
  currentComment: string;
  recipients: any[];
  visible = true;

  constructor(
    private userService: UserService,
    private eventsService: EventsService,
    private eh: ErrorHandleService,
    private fb: FormBuilder,
    public fh: FormHelperService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    this._userSubscription = this.userService.userChanged$.subscribe(user => {
      this.user = user;
    });

    this.loadingEvent = true;

    this.route.params.forEach((params: Params) => {
      const id = +params['id'];
      this.eventsService.getEventWithDetails(id).then(
        response => {
          this.addParticipantForm = this.fb.group({
            email: new FormControl('', [Validators.required])
          });

          this.loadingEvent = false;
          this.event = response['event'];
          this.gifts = response['gifts'].map(item => item.gift);
          for (const elt of response['gifts']) {
            this.hasComments[elt.gift.id] = elt.hasCommentNotification;
          }
          this.recipients = [];
          this.recipients.push({ label: 'Everyone', value: null });
          const uniqueRecipients = new Set();
          for (const g of this.gifts) {
            if (g['to']) {
              uniqueRecipients.add(g['to']['userName']);
            }
          }
          for (const r of uniqueRecipients) {
            this.recipients.push({ label: r, value: r });
          }

          this.participants = response['participants'];
        },
        err => {
          this.error = err;
        }
      );
    });
  }

  // ugly hack https://stackoverflow.com/questions/40077150/how-to-programmaticaly-trigger-refresh-primeng-datatable-when-a-button-is-clicke
  updateTable(): void {
    this.visible = false;
    setTimeout(() => (this.visible = true), 0);
  }

  openBuyGiftModal(gift: Object) {
    if (!this.canBuyGift(gift)) {
      return;
    }
    this.giftToBuy = gift;
    this.giftToBuyNewStatus = gift['status'];

    this.modalService.open(this.buyGiftModal).result.then(
      result => {
        this.buyGift();
      },
      reason => {
        return;
      }
    );
  }

  updateGift(gift: Object) {
    console.log(gift);
    const id = gift['id'];
    const updateItem = this.gifts.find(x => x['id'] === id);
    if (updateItem) {
      const index = this.gifts.indexOf(updateItem);
      this.gifts[index] = gift;
    } else {
      this.gifts.push(gift);
      this.hasComments[id] = false;
    }
    this.updateTable();
  }

  buyGift() {
    this.eventsService
      .updateGiftStatus(this.giftToBuy['id'], this.giftToBuyNewStatus)
      .then(response => {
        this.updateGift(response);
      })
      .catch(err => {
        this.eh.handleError(err);
      });
  }

  canBuyGift(gift: Object) {
    return (
      gift['to']['id'] !== this.user['id'] &&
      (!gift['from'] || gift['from']['id'] === this.user['id'])
    );
  }

  canEditGift(gift: Object) {
    return !(gift['secret'] && gift['to']['id'] === this.user['id']);
  }

  addParticipant(formData: any) {
    this.eventsService
      .addParticipant(this.event['id'], {
        email: formData['email'],
        role: 'Owner' // hardcoded for now
      })
      .then(response => {
        this.participants.push(response);
      })
      .catch(err => {
        this.eh.handleError(err);
      });
  }

  openDeleteGiftModal(id: number) {
    this.deleteGiftId = id;
    this.modalService.open(this.deleteGiftModal).result.then(
      result => {
        this.deleteGift();
      },
      reason => {
        return;
      }
    );
  }

  deleteGift() {
    this.eventsService
      .deleteGift(this.event['id'], this.deleteGiftId)
      .then(_ => {
        this.gifts = this.gifts.filter(obj => obj['id'] !== this.deleteGiftId);
      })
      .catch(err => {
        this.eh.handleError(err);
      });
  }

  openCommentGiftModal(gift: Object) {
    this.giftToComment = gift;
    this.currentComment = '';
    this.hasComments[gift['id']] = false;

    this.modalService.open(this.commentGiftModal);
    this.eventsService
      .getGiftComments(this.event['id'], gift['id'])
      .then(response => {
        this.comments = response['comments'];
      })
      .catch(err => {
        this.eh.handleError(err);
      });
  }

  addComment() {
    this.eventsService
      .addGiftComments(
        this.event['id'],
        this.giftToComment['id'],
        this.currentComment
      )
      .then(response => {
        this.currentComment = '';
        this.comments = response['comments'];
      })
      .catch(err => {
        this.eh.handleError(err);
      });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this._userSubscription.unsubscribe();
  }
}
