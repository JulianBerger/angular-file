import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';

import { FileUploader } from './file-uploader.class';

@Directive({selector: '[ng2FileDrop]'})
export class FileDropDirective {
  @Input() public uploader:FileUploader = new FileUploader({});
  @Output() public fileOver:EventEmitter<any> = new EventEmitter();
  @Output() public onFileDrop:EventEmitter<File[]> = new EventEmitter<File[]>();
  
  @Input('ng2FileDrop') public ref:any
  @Output('ng2FileDropChange') public refChange:EventEmitter<FileDropDirective> = new EventEmitter()

  protected element:ElementRef;

  public constructor(element:ElementRef) {
    this.element = element;
  }

  public ngOnInit(){
    //create reference to this class with one cycle delay to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(()=>this.refChange.emit(this), 0)
  }

  public getOptions():any {
    return this.uploader.options;
  }

  public getFilters():any {
    return {};
  }

  @HostListener('drop', ['$event'])
  public onDrop(event:any):void {
    let transfer = this._getTransfer(event);
    if (!transfer) {
      return;
    }

    this._preventAndStop(event);
    this.uploader.addToQueue(transfer.files);
    this.fileOver.emit(false);
    this.onFileDrop.emit(transfer.files);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event:any):void {
    let transfer = this._getTransfer(event);
    if (!this._haveFiles(transfer.types)) {
      return;
    }

    transfer.dropEffect = 'copy';
    this._preventAndStop(event);
    this.fileOver.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event:any):any {
    if ((this as any).element) {
      if (event.currentTarget === (this as any).element[0]) {
        return;
      }
    }

    this._preventAndStop(event);
    this.fileOver.emit(false);
  }

  protected _getTransfer(event:any):any {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
  }

  protected _preventAndStop(event:any):any {
    event.preventDefault();
    event.stopPropagation();
  }

  protected _haveFiles(types:any):any {
    if (!types) {
      return false;
    }

    if (types.indexOf) {
      return types.indexOf('Files') !== -1;
    } else if (types.contains) {
      return types.contains('Files');
    } else {
      return false;
    }
  }

  /*
   _addOverClass(item:any):any {
   item.addOverClass();
   }

   _removeOverClass(item:any):any {
   item.removeOverClass();
   }*/
}