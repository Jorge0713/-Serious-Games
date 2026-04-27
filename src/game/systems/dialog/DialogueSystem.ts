import * as Phaser from "phaser";

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

  private fullText = "";
  private currentText = "";
  private index = 0;

  private isTyping = false;
  private canContinue = false;
  private typingEvent: Phaser.Time.TimerEvent | null = null; 

  constructor(config: DialogueConfig) {
    this.scene = config.scene;

    // Caja de diálogo
    this.box = this.scene.add.graphics();
    this.box.fillStyle(0xffffff, 1);
    this.box.fillRoundedRect(config.x, config.y, config.width, 100, 16);

    // Texto
    this.text = this.scene.add.text(config.x + 10, config.y + 10, "", {
      fontFamily: "Gill Sans MT", 
      fontSize: "19px",
      color: "#000",
      wordWrap: { width: config.width - 20 }
    });
  }

  show(text: string, duration: number = 2000) {
    if (this.typingEvent){
      this.typingEvent.remove(false); 
      this.typingEvent = null;
    }
    this.fullText = text;
    this.currentText = "";
    this.index = 0;
    this.isTyping = true;
    this.canContinue = false;

    this.text.setText("");

    this.typeEffect();

    // desbloquear después de X tiempo
    this.scene.time.delayedCall(duration, () => {
      this.canContinue = true;
    });
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

  destroy() {
    this.text.destroy();
    this.box.destroy();
  }
}