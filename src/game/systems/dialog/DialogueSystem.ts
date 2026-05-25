import * as Phaser from "phaser";
import { FONT_DISPLAY } from "../../../config/gameFonts";

type DialogueConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
};

export class DialogueSystem {
  private scene: Phaser.Scene;
  private text!: Phaser.GameObjects.Text;
  private box!: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private readonly padding = 10;
  private readonly minHeight = 100;
  private readonly maxHeight = 220;

  private fullText = "";
  private currentText = "";
  private index = 0;

  private isTyping = false;
  private canContinue = false;
  private typingEvent: Phaser.Time.TimerEvent | null = null; 

  constructor(config: DialogueConfig) {
    this.scene = config.scene;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;

    // Caja de diálogo
    this.box = this.scene.add.graphics();

    // Texto
    this.text = this.scene.add.text(this.x + this.padding, this.y + this.padding, "", {
      fontFamily: FONT_DISPLAY, 
      fontSize: "19px",
      color: "#000",
      lineSpacing: 3,
      wordWrap: { width: this.width - this.padding * 2 }
    });
    this.drawBox(this.minHeight);
  }

  show(text: string, duration: number = 2000) {
    if (this.typingEvent){
      this.typingEvent.remove(false); 
      this.typingEvent = null;
    }
    this.box.setVisible(true);
    this.text.setVisible(true);
    this.fullText = text;
    this.currentText = "";
    this.index = 0;
    this.isTyping = true;
    this.canContinue = false;

    this.fitBoxToText(text);
    this.text.setText("");

    if (text.length === 0) {
      this.isTyping = false;
      this.canContinue = true;
      return;
    }

    this.typeEffect();

    // desbloquear después de X tiempo
    this.scene.time.delayedCall(duration, () => {
      this.canContinue = true;
    });
  }

  private fitBoxToText(text: string) {
    const previousText = this.text.text;

    this.text.setText(text);
    this.text.updateText();

    const height = Phaser.Math.Clamp(
      this.text.height + this.padding * 2,
      this.minHeight,
      this.maxHeight
    );

    this.text.setText(previousText);
    this.drawBox(height);
  }

  private drawBox(height: number) {
    this.box.clear();
    this.box.fillStyle(0xffffff, 1);
    this.box.fillRoundedRect(this.x, this.y, this.width, height, 16);
  }

  private typeEffect() {
    this.typingEvent = 
    this.scene.time.addEvent({
      delay: 30,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.currentText += this.fullText[this.index];
        this.text.setText(this.currentText);
        this.index++;

        if (this.index >= this.fullText.length) {
          this.isTyping = false;
        }
      }
    });
  }
  private finishText() { 
    if (this.typingEvent){
      this.typingEvent.remove(false);
      this.typingEvent = null; 
    }
      this.text.setText(this.fullText);
      this.currentText = this.fullText; 
      this.index = this.fullText.length; 
      
      this.isTyping = false; 
      this.canContinue = true;
  }
  

  next(onComplete: () => void) {
    if(this.isTyping){ 
      this.finishText(); 
      return; 
    }
    if (!this.canContinue) return;

    onComplete();
  }

  hide() {
    if (this.typingEvent){
      this.typingEvent.remove(false);
      this.typingEvent = null;
    }

    this.fullText = "";
    this.currentText = "";
    this.index = 0;
    this.isTyping = false;
    this.canContinue = false;
    this.text.setText("");
    this.box.setVisible(false);
    this.text.setVisible(false);
  }

  destroy() {
    this.text.destroy();
    this.box.destroy();
  }
}
