import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DialogActionButton, NgxMgwDialogMatDialogService, ResultDialog } from '../../../../ngx-mgw-dialog-mat-dialog/src/public-api';

const boutonBis: DialogActionButton = {
  libelle: 'non',
  color: 'warn',
  noFocus: true
}

interface TestFormGroup {
  animal: FormControl<string>;
  autre: FormControl<string>;
  1: FormControl<number>;
}

@Component({
  selector: 'app-dialog-test',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './dialog-test.component.html',
  styleUrl: './dialog-test.component.scss'
})
export class DialogTestComponent {
  @ViewChild('customTitle') customTitle: TemplateRef<unknown> | undefined;

  private readonly ngxMgwDialogMatDialogService = inject(NgxMgwDialogMatDialogService);

  private readonly testFormGroup: FormGroup<TestFormGroup>;

  readonly name: string | undefined;

  constructor() {
    const fb = new FormBuilder();
    this.testFormGroup = fb.nonNullable.group<TestFormGroup>({
      animal: fb.nonNullable.control<string>({ value: '', disabled: false }, Validators.pattern(/[A-Z]/)),
      autre: fb.nonNullable.control<string>(''),
      1: fb.nonNullable.control<number>(0),
    });
  }

  openDialog(): void {
    const actions = {
      a: {
        libelle: 'Coucou',
        rr: 'rr'
      },
      b: boutonBis,
      c: 'Codscds'
    };

    this.ngxMgwDialogMatDialogService
      .openDialogFormConfig(
        {
          rubrique: { contenu: 'Sans <i>subtitle</i> mais avec <u>html</u>', isHtml: true },
          formElem: 'animal'
        },
        {
          animal: {
            errorLabel: 'Saisie !!!!',
            hintText: 'Chat, chien, ...',
            width: '100%',
            maxWidth: '500px',
            labelPosition: 'before',
            isSelect: true,
            values: [{ value: 1, texte: 'Coucou' }, { value: 2, texte: 'Coucccou' }],
            selectResetText: ' * Aucun'
          }
        },
        this.testFormGroup,
        {
          actionsConfig: {
            actions,
            actionsAlign: 'center',
            autoFocus: 'b'
          },
          dialogConfig: {
            width: '450px'
          }
        }
      )
      .afterClosed()
      .subscribe(result => {
        if (result?.result === ResultDialog.Close) {
          console.log('The dialog was closed by close button', result, this.testFormGroup.value);
        } else if (result?.action) {
          console.log('The dialog was closed by button :', result?.action, this.testFormGroup.value);
        } else {
          console.log('The dialog was closed', this.testFormGroup.value);
        }
      });
  }
}
