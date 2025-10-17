import { inject, Injectable, TemplateRef } from '@angular/core';

import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import {
  DialogActionButton,
  DialogActionsAlignValues,
  DialogContent,
  DialogFormElemConfig,
  KeyOfRecordActions,
  MessageHtml,
  NgxMgwDialogMatDialogComponent,
  NgxMgwDialogMatDialogData,
  NgxMgwDialogMatDialogResult
} from '../ngx-mgw-dialog-mat-dialog/ngx-mgw-dialog-mat-dialog.component';
import { AbstractControl, FormGroup } from '@angular/forms';

type DialogConfigValue<KA extends KeyOfRecordActions> = Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>;

export interface TitleConfig<T extends string | MessageHtml | TemplateRef<unknown> = string | MessageHtml | TemplateRef<unknown>> {
  title: T;
  noCloseButton?: true;
}

export interface NgxMgwDialogMatDialogConfig<
  KAction extends KeyOfRecordActions = string,
  TTitle extends string | TemplateRef<unknown> = string | TemplateRef<unknown>,
  TContent extends string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>> =
    | string
    | MessageHtml
    | TemplateRef<unknown>
    | Array<string | DialogContent<never>>,
  TTitleConfig extends string | MessageHtml | TemplateRef<unknown> = string | MessageHtml | TemplateRef<unknown>
> {
  title?: TTitle | TitleConfig<TTitleConfig>;
  content?: TContent;
  dialogConfig?: DialogConfigValue<KAction>;
}

function isSimpleTypeValue(value: unknown): value is string | number | boolean | undefined {
  if (value === undefined || typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
    return true;
  }
  return false;
}

function getDialogContentHtml(contenu: string | DialogContent<never>): DialogContent<never> {
  if (typeof contenu === 'string') {
    return {
      rubrique: {
        contenu,
        isHtml: true
      }
    };
  }
  if (typeof contenu.rubrique === 'string') {
    return {
      subtitle: contenu.subtitle,
      rubrique: {
        contenu: contenu.rubrique,
        isHtml: true
      }
    };
  }
  return contenu;
}

@Injectable({
  providedIn: 'root'
})
export class NgxMgwDialogMatDialogService {
  private readonly matDialog = inject(MatDialog);

  private dialogOpen<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = any,
    KF extends keyof TC & string = any,
    KFE extends KF = KF
  >(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<KFE>> | undefined,
    actions: Record<KA, string | DialogActionButton> | undefined,
    autoFocusOrDialogConfig: KAF | boolean | DialogConfigValue<KA> | undefined,
    actionsAlign: DialogActionsAlignValues | undefined,
    dialogConfig: DialogConfigValue<KA> | undefined,
    formElems?: Record<KF, DialogFormElemConfig>,
    formGroup?: FormGroup<TC>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération titre config (si title simple alors pas de noCloseButton)
    const titleConfig: TitleConfig | undefined =
      typeof title === 'string' || title instanceof TemplateRef ? ({ title } satisfies TitleConfig<string | TemplateRef<unknown>>) : title;

    const dialogConfigValue: DialogConfigValue<KA> | undefined = isSimpleTypeValue(autoFocusOrDialogConfig) ? dialogConfig : autoFocusOrDialogConfig;

    const config: NgxMgwDialogMatDialogData<KA> = {
      title: titleConfig?.title,
      content,
      actions,
      actionsAlign,
      noCloseButton: titleConfig?.noCloseButton,
      formElems,
      formGroup
    };

    // on teste si on a une valeur autoFocus dans le paramètre autoFocusOrDialogConfig
    const autoFocusActionValue = isSimpleTypeValue(autoFocusOrDialogConfig) ? autoFocusOrDialogConfig : undefined;
    // la valeur undefined doit devenir true (comportement par défaut si autoFocus non précisé on focus sur le premier bouton)
    const autoFocusValue = autoFocusActionValue ?? true;

    return this.matDialog.open<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogData<KA>, NgxMgwDialogMatDialogResult<KA>>(NgxMgwDialogMatDialogComponent<KA>, {
      ...dialogConfigValue,
      data: config,
      autoFocus: typeof autoFocusValue === 'boolean' ? autoFocusValue : `button[name="btn-${autoFocusValue}"]`
    });
  }

  private dialogOpenHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TitleConfig<string> | undefined,
    contenu: string | Array<string | DialogContent<never>> | undefined,
    actions: Record<KA, string | DialogActionButton> | undefined,
    autoFocusOrDialogConfig: KAF | boolean | DialogConfigValue<KA> | undefined,
    actionsAlign: DialogActionsAlignValues | undefined,
    dialogConfig: DialogConfigValue<KA> | undefined
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération titre config converti en MessageHtml
    const titleConfig: TitleConfig<string> | undefined = typeof title === 'string' ? { title } : title;
    // titre converti en MessageHtml
    const titleConfigHtml: TitleConfig<MessageHtml> | undefined = titleConfig
      ? { title: { contenu: titleConfig.title, isHtml: true }, noCloseButton: titleConfig.noCloseButton }
      : undefined;

    // content converti en type MessageHtml si string et en Tableau de DialogContent avec MessageHtml si tableau de string
    const content: MessageHtml | Array<DialogContent<never>> | undefined =
      typeof contenu === 'string' ? { contenu, isHtml: true } : contenu?.map<DialogContent<never>>(getDialogContentHtml);

    return this.dialogOpen(titleConfigHtml, content, actions, autoFocusOrDialogConfig, actionsAlign, dialogConfig);
  }

  openDialog<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: KAF | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialog<KA extends KeyOfRecordActions>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  /**
   *
   * @param {Record<K, DialogActionsData>} [actions] {@link DialogActionsData}
   * @param {K | boolean} [autoFocus] Valeur permettant de gérer le focus sur les boutons d'actions du dialog :
   *  - Si `autoFocus` égal à `true` on force le focus automatique sur le premier bouton (valeur paramètre `autoFocus`: `true`).
   *  - Si `autoFocus` égal à `false` on désactive le focus (valeur paramètre `autoFocus`: `false`).
   *  - Si `autoFocus` `undefined` alors on prend la valeur par défaut qui est le focus automatique sur le premier bouton (`autoFocus` = `true`).
   *  - Sinon on focus sur le bouton avec la valeur nom = `K`
   * @returns
   */
  openDialog<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: KAF | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content
    // le dialogConfig va être récupérer dans le bon paramètre
    return this.dialogOpen(title, content, actions, autoFocusOrDialogConfig, actionsAlign, dialogConfig);
  }

  openDialogHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: KAF | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogHtml<KA extends KeyOfRecordActions>(
    title: string | TitleConfig<string>,
    content: string | Array<string | DialogContent<never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: KAF | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content qui seront converti en objet MessageHtml
    return this.dialogOpenHtml(title, content, actions, autoFocusOrDialogConfig, actionsAlign, dialogConfig);
  }

  openDialogNoCloseButton<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: KAF | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogNoCloseButton<KA extends KeyOfRecordActions>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogNoCloseButton<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: KAF | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // ajout du paramètre noCloseButton
    // on va appeler dialogOpen en passant le titre (en le convertissant en TitleConfig avec noCloseButton), le content sera appelé directement
    return this.dialogOpen({ title, noCloseButton: true }, content, actions, autoFocusOrDialogConfig, actionsAlign, dialogConfig);
  }

  openDialogConfig<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    config: NgxMgwDialogMatDialogConfig<KA>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: KAF | boolean,
    actionsAlign?: DialogActionsAlignValues
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération des paramètres directement depuis l'objet config
    return this.dialogOpen(config.title, config.content, actions, autoFocus, actionsAlign, config.dialogConfig);
  }

  openDialogForm<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = any,
    KF extends keyof TC & string = any,
    KFE extends KF = KF
  >(
    content: DialogContent<KFE> | Array<string | DialogContent<KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title?: string | TemplateRef<unknown> | TitleConfig,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: KAF | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogForm<
    KA extends KeyOfRecordActions,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = any,
    KF extends keyof TC & string = any,
    KFE extends KF = KF
  >(
    content: DialogContent<KFE> | Array<string | DialogContent<KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title: string | TemplateRef<unknown> | TitleConfig,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogForm<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = any,
    KF extends keyof TC & string = any,
    KFE extends KF = KF
  >(
    content: DialogContent<KFE> | Array<string | DialogContent<KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title?: string | TemplateRef<unknown> | TitleConfig,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: KAF | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on rajoute les éléments du formulaire
    const contentList = Array.isArray(content) ? content : [content];
    return this.dialogOpen(title, contentList, actions, autoFocusOrDialogConfig, actionsAlign, dialogConfig, formElems, formGroup);
  }
}
