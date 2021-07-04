import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { DES, enc } from 'crypto-js';
import { breakPuzzle, generatePuzzles, getMasterKey } from './shared/puzzle';

const CREATE_ROOM_ENDPOINT = 'http://localhost:3000/create-room';
const ENTER_ROOM_ENDPOINT = 'http://localhost:3000/enter-room';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  //@ts-ignore
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  public messages = new Array();
  public clientId = this.mqttService.clientId;
  public msgs: any = [];
  public keys: any = [];
  public secrets: any = [];
  public masterKey = '';

  public createRoomForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    puzzles: new FormControl('', []),
  });

  public enterRoomForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  public chatForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
    client: new FormControl(this.clientId, [Validators.required]),
  });

  constructor(private mqttService: MqttService, private http: HttpClient) {}

  ngOnInit() {
    this.listenStartChat();

    this.mqttService.observe('chat_des').subscribe((message: IMqttMessage) => {
      if (!message.retain) {
        let messageReceveid = JSON.parse(message.payload.toString());
        messageReceveid = JSON.parse(
          DES.decrypt(messageReceveid, this.masterKey).toString(enc.Utf8)
        );
        this.messages.push(messageReceveid);
        setTimeout(() => {
          this.scrollToBottom();
        }, 1);
      }
    });
  }

  public createRoom() {
    if (this.createRoomForm.valid) {
      let puzzles = generatePuzzles();
      this.msgs = puzzles.msgs;
      this.secrets = puzzles.secrets;
      this.keys = puzzles.keys;

      let data = this.createRoomForm.value;
      data.puzzles = JSON.stringify(this.msgs, this.refReplacer());
      this.http.post(CREATE_ROOM_ENDPOINT, data).subscribe((result) => {});
    }
  }

  public enterRoom() {
    if (this.enterRoomForm.valid) {
      let { name } = this.enterRoomForm.value;
      this.http
        .get(`${ENTER_ROOM_ENDPOINT}?name=${name}`)
        .subscribe((result) => {
          this.startChat(result);
        });
    }
  }

  public sendMessage() {
    if (this.chatForm.valid) {
      let message = this.chatForm.value;
      message = DES.encrypt(JSON.stringify(message), this.masterKey);
      this.mqttService.unsafePublish(
        'chat_des',
        JSON.stringify(message, this.refReplacer()),
        {
          qos: 0,
          retain: false,
        }
      );
    }
  }

  public startChat(msgs: any) {
    msgs = JSON.parse(msgs.puzzles);
    let { key, msg } = breakPuzzle(msgs);
    this.masterKey = getMasterKey(msg);
    let data = { key, clientId: this.clientId };
    this.mqttService.unsafePublish('start', JSON.stringify(data), {
      qos: 0,
      retain: false,
    });
  }

  public listenStartChat() {
    this.mqttService.observe('start').subscribe((message: IMqttMessage) => {
      if (!message.retain) {
        let messageReceveid = JSON.parse(message.payload.toString());
        if (messageReceveid.clientId != this.clientId) {
          let keyIndex = this.keys.findIndex(
            (key: any) => key == messageReceveid.key
          );
          this.masterKey = this.secrets[keyIndex];
        }
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  refReplacer() {
    let m = new Map(),
      v = new Map(),
      init: null = null;

    return (field: string, value: any) => {
      let p = m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
      let isComplex = value === Object(value);

      if (isComplex) m.set(value, p);

      let pp = v.get(value) || '';
      let path = p.replace(/undefined\.\.?/, '');
      let val = pp ? `#REF:${pp[0] == '[' ? '$' : '$.'}${pp}` : value;

      !init ? (init = value) : val === init ? (val = '#REF:$') : 0;
      if (!pp && isComplex) v.set(value, path);

      return val;
    };
  }
}
