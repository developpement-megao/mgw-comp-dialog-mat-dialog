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
      .openDialogForm(
[
            'coucou\nJe saute une ligne',
            {
              subtitle: 'Develop across all platforms',
              rubrique:
                'Learn one way to build <b>applications</b> with Angular and reuse your code and abilities to build apps for any deployment target. For web, mobile web, native mobile and native desktop.'
                ,
                formElem: 'animal'
            },
            {
              subtitle: 'avec html',
              rubrique: { contenu: '<b>Gras</b><br/><br/>Je viens de faire un double br.\n\nEt la double n', isHtml: true, labelColor: 'red',textAlign: 'end' }
            },
            {
              subtitle: 'avec obket html \nhtml mais isHtml false',
              rubrique: { contenu: 'Pas de html', isHtml: false, textAlign: 'center' }
            },
            {
              rubrique: { contenu: 'Sans <i>subtitle</i> mais avec <u>html</u>', isHtml: true }
            },
            'Je <b>le</b> suis'
          ],
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
            title: { contenu: this.name || 'Install <b>Angular</b>', isHtml: true },
            noCloseButton: true
          },

        actions,
        'b',
        'center',
{
            width: '450px'
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
