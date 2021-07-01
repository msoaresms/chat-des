import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { breakPuzzle, generatePuzzles } from './shared/puzzle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public messages = new Array();
  public clientId = this.mqttService.clientId;

  public chatForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
    client: new FormControl(this.clientId, [Validators.required]),
  });

  constructor(private mqttService: MqttService) {}

  ngOnInit() {
    this.mqttService.observe('chat_des').subscribe((message: IMqttMessage) => {
      if (!message.retain) {
        let messageReceveid = JSON.parse(message.payload.toString());
        this.messages.push(messageReceveid);
        //@ts-ignore
        document.getElementById("messages")?.scrollTop(document.getElementById("messages")[0]?.scrollHeight);
      }
    });
    // let { msgs, keys } = generatePuzzles();
    // breakPuzzle(msgs);
    // testDES();
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
}
