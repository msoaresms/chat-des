import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { PageScrollService } from 'ngx-page-scroll-core';
import { breakPuzzle, generatePuzzles, testDES } from './shared/puzzle';

const CREATE_ROOM_ENDPOINT = 'http://localhost:3000/create-room';
const ENTER_ROOM_ENDPOINT = 'http://localhost:3000/enter-room';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public messages = new Array();
  public clientId = this.mqttService.clientId;
  public msgs = [];
  public keys = [];
  public secrets = [];

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

  constructor(
    private mqttService: MqttService,
    private pageScrollService: PageScrollService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.mqttService.observe('chat_des').subscribe((message: IMqttMessage) => {
      if (!message.retain) {
        let messageReceveid = JSON.parse(message.payload.toString());
        this.messages.push(messageReceveid);
        this.pageScrollService.scroll;
        // this.chatForm.controls.message.setValue("");
        //@ts-ignore
        // document.getElementById("messages")?.scrollTop(document.getElementById("messages")[0]?.scrollHeight);
      }
    });
    // let { msgs, keys } = generatePuzzles();
    // breakPuzzle(msgs);
    // testDES();
  }

  public createRoom() {
    if (this.createRoomForm.valid) {
      let { secrets, keys, msgs } = generatePuzzles();
      let data = this.createRoomForm.value;
      data.puzzles = JSON.stringify(msgs, this.refReplacer());
      this.http.post(CREATE_ROOM_ENDPOINT, data).subscribe((result) => {
        console.log(result);
      });
    }
  }

  public enterRoom() {
    if (this.enterRoomForm.valid) {
      let { name } = this.enterRoomForm.value;
      this.http
        .get(`${ENTER_ROOM_ENDPOINT}?name=${name}`)
        .subscribe((result) => {
          console.log(result);
        });
    }
  }

  public sendMessage() {
    if (this.chatForm.valid) {
      let message = this.chatForm.value;
      this.mqttService.unsafePublish('chat_des', JSON.stringify(message), {
        qos: 0,
        retain: false,
      });
    }
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
