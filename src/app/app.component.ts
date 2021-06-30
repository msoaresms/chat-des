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
  public messages = [];

  public chatForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  constructor(private mqttService: MqttService) {}

  ngOnInit() {
    this.mqttService
      .observe('messages')
      .subscribe((message: IMqttMessage) => {});
    // let { msgs, keys } = generatePuzzles();
    // breakPuzzle(msgs);
    // testDES();
  }
}
