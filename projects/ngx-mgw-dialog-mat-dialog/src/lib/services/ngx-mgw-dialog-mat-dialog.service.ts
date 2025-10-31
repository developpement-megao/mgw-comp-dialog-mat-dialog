/* eslint-disable capitalized-comments */
import { inject, Injectable, TemplateRef } from '@angular/core';

import { AbstractControl, FormGroup } from '@angular/forms';

import { AutoFocusTarget, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import {
  DialogActionButton,
  DialogActionsAlignValues,
  DialogContent,
  DialogFormElemConfig,
  MessageHtml,
  NgxMgwDialogMatDialogComponent,
  NgxMgwDialogMatDialogData,
  NgxMgwDialogMatDialogResult,
  OnlyNonNumericStringKeys,
  ResultDialog
} from '../ngx-mgw-dialog-mat-dialog/ngx-mgw-dialog-mat-dialog.component';

// first-tabbable :	Focus the first tabbable element. This is the default setting.
const AUTO_FOCUS_TARGET_FIRST_TABBABLE = 'first-tabbable';

const AUTO_FOCUS_TARGET_FIRST_ACTION = 'first-action';
const AUTO_FOCUS_TARGET_LAST_ACTION = 'last-action';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AUTO_FOCUS_TARGET_ACTION = [AUTO_FOCUS_TARGET_FIRST_ACTION, AUTO_FOCUS_TARGET_LAST_ACTION] as const;

type AutoFocusTargetFirstLastAction = (typeof AUTO_FOCUS_TARGET_ACTION)[number];

type DialogConfigValue = Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>;

export type AutoFocusTargetAction = AutoFocusTarget | AutoFocusTargetFirstLastAction;

export interface TitleConfig<T extends string | MessageHtml | TemplateRef<unknown> = string | MessageHtml | TemplateRef<unknown>> {
  title: T;
  noCloseButton?: true;
}

export interface ActionsConfig<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>> {
  autoFocus?: (KA & KAF) | boolean;
  autoFocusTargetAction?: AutoFocusTargetAction;
  actionsAlign?: DialogActionsAlignValues;
}

export interface NgxMgwDialogMatDialogConfig<
  TTitle extends string | TemplateRef<unknown> = string | TemplateRef<unknown>,
  TContent extends string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>> =
    | string
    | MessageHtml
    | TemplateRef<unknown>
    | Array<string | DialogContent<string & never>>,
  TTitleConfig extends string | MessageHtml | TemplateRef<unknown> = string | MessageHtml | TemplateRef<unknown>
> {
  title?: TTitle | TitleConfig<TTitleConfig>;
  content?: TContent;
  dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>;
}

function isSimpleTypeValue(value: unknown): value is string | number | boolean | symbol | undefined {
  if (value === undefined || typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol') {
    return true;
  }
  return false;
}

function isAutoFocusTargetActionValue(value: AutoFocusTargetAction | undefined): value is AutoFocusTargetFirstLastAction {
  if (value === AUTO_FOCUS_TARGET_FIRST_ACTION || value === AUTO_FOCUS_TARGET_LAST_ACTION) {
    return true;
  }
  if (value === undefined || value === 'dialog' || value === 'first-heading' || value === 'first-tabbable') {
    return false;
  }
  const exhaustiveCheck: never = value;
  return exhaustiveCheck;
}

function getAutoFocusValueButtonTarget<K extends string>(autoFocusValue: K): string {
  return `button[name="btn-${autoFocusValue}"]`;
}

function getAutoFocusTargetActionValue<K extends PropertyKey>(
  actions: Record<K, string | DialogActionButton> | undefined,
  autoFocusTargetAction: AutoFocusTargetAction | undefined
): string {
  if (isAutoFocusTargetActionValue(autoFocusTargetAction)) {
    // récupération des actions
    const actionsKeys = actions ? Object.keys(actions) : undefined;
    const actionsKeysNb = actionsKeys?.length;
    if (actionsKeysNb) {
      // on a des actions on va renvoyer le nom du bouton (premier ou dernier)
      const autoFocusIndex: number = autoFocusTargetAction === 'first-action' ? 0 : actionsKeysNb - 1;
      return getAutoFocusValueButtonTarget(actionsKeys[autoFocusIndex]);
    }
    // pas d'action on prendra l'action par défaut
    return AUTO_FOCUS_TARGET_FIRST_TABBABLE;
  }
  // on renvoit la valeur de autoFocusTargetAction
  return autoFocusTargetAction ?? AUTO_FOCUS_TARGET_FIRST_TABBABLE;
}

function getAutoFocusValue<K extends string>(autoFocus: K | false): string | false {
  return autoFocus === false ? false : getAutoFocusValueButtonTarget(autoFocus);
}

function getDialogTitleHtml(title: string | TitleConfig<string> | undefined): TitleConfig<MessageHtml> | undefined {
  // récupération titre config converti en MessageHtml
  const titleConfig: TitleConfig<string> | undefined = typeof title === 'string' ? { title } : title;
  // titre converti en MessageHtml
  if (titleConfig) {
    return {
      title: {
        contenu: titleConfig.title,
        isHtml: true
      },
      noCloseButton: titleConfig.noCloseButton
    };
  }
  return undefined;
}

function getDialogContentHtml(
  contenu: string | Array<string | DialogContent<string & never>> | undefined
): MessageHtml | Array<DialogContent<string & never>> | undefined {
  // content converti en type MessageHtml si string et en Tableau de DialogContent avec MessageHtml si tableau de string
  if (typeof contenu === 'string') {
    return {
      contenu,
      isHtml: true
    };
  }
  return contenu?.map<DialogContent<string & never>>((c) => {
    if (typeof c === 'string') {
      return {
        rubrique: {
          contenu: c,
          isHtml: true
        }
      };
    }
    if (typeof c.rubrique === 'string') {
      return {
        subtitle: c.subtitle,
        rubrique: {
          contenu: c.rubrique,
          isHtml: true
        }
      };
    }
    return c;
  });
}

@Injectable({
  providedIn: 'root'
})
export class NgxMgwDialogMatDialogService {
  private readonly matDialog = inject(MatDialog);

  private dialogOpen<
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    KAF extends OnlyNonNumericStringKeys<KA> & string = never,
    TC extends { [K in keyof TC]: AbstractControl<unknown> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<KF & KFE>> | undefined,
    dialogConfig: DialogConfigValue | undefined,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    autoFocusTargetAction?: AutoFocusTargetAction,
    formElems?: Record<KF, DialogFormElemConfig>,
    formGroup?: FormGroup<TC>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // récupération titre config (si title simple alors pas de noCloseButton)
    const titleConfig: TitleConfig | undefined =
      typeof title === 'string' || title instanceof TemplateRef ? ({ title } satisfies TitleConfig<string | TemplateRef<unknown>>) : title;

    const config: NgxMgwDialogMatDialogData<KA, TC, KF, KFE> = {
      title: titleConfig?.title,
      content,
      actions,
      actionsAlign,
      noCloseButton: titleConfig?.noCloseButton,
      formElems,
      formGroup
    };

    // si autoFocus égal à true ou pas défini on prend autoFocusTargetAction (si c'est du type first ou last action uniquement si actions) et sinon autoFocus
    // la valeur undefined doit devenir true (comportement par défaut si autoFocus non précisé on focus sur le premier bouton)
    const autoFocusValue = autoFocus === true || autoFocus === undefined ? getAutoFocusTargetActionValue(actions, autoFocusTargetAction) : getAutoFocusValue(autoFocus);

    return this.matDialog.open<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, NgxMgwDialogMatDialogData<KA, TC, KF, KFE>, NgxMgwDialogMatDialogResult<TR, KA>>(
      NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>,
      {
        ...dialogConfig,
        data: config,
        autoFocus: autoFocusValue
      }
    );
  }

  private dialogOpenForm<
    TC extends { [K in keyof TC]: AbstractControl<unknown> },
    KF extends keyof TC & string,
    KFE extends KF,
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    KAF extends OnlyNonNumericStringKeys<KA> & string = never
  >(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    dialogConfig: DialogConfigValue | undefined,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    autoFocusTargetAction?: AutoFocusTargetAction
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // dialog avec formulaire et content
    const contentList = Array.isArray(content) ? content : [content];
    return this.dialogOpen<TR, KA, KAF, TC, KF, KFE>(title, contentList, dialogConfig, actions, autoFocus, actionsAlign, autoFocusTargetAction, formElems, formGroup);
  }

  private dialogOpenActions<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> & string, TR extends ResultDialog.Close>(
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>> | undefined,
    dialogConfig: DialogConfigValue | undefined,
    actions: Record<KA, string | DialogActionButton> | undefined,
    autoFocusOrDialogConfig: (KA & KAF) | boolean | DialogConfigValue | undefined,
    actionsAlign: DialogActionsAlignValues | undefined,
    title?: string | TemplateRef<unknown> | TitleConfig
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // récupération bonne valeur de dialogConfig et autoFocus
    // on teste si on a une valeur autoFocus dans le paramètre autoFocusOrDialogConfig
    if (isSimpleTypeValue(autoFocusOrDialogConfig)) {
      // autoFocusOrDialogConfig est l'autoFocus et dalogConfig est dans dalogConfig
      return this.dialogOpen<TR, KA, KAF>(title, content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
    }
    // autoFocusOrDialogConfig est le dialogConfig et on n'a pas d'autoFocus (et pas non plus d'autres paramètres pour les actions)
    return this.dialogOpen<TR, KA>(title, content, autoFocusOrDialogConfig, actions);
  }

  private dialogOpenActionsConfig<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> & string, TR extends ResultDialog.Close>(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>> | undefined,
    dialogConfig: DialogConfigValue | undefined,
    actions: Record<KA, string | DialogActionButton> | undefined,
    actionsConfig: ActionsConfig<KA, KAF> | undefined
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<TR, KA>> {
    if (actions) {
      // on a des actions
      return this.dialogOpen<TR, KA, KAF>(
        title,
        content,
        dialogConfig,
        actions,
        actionsConfig?.autoFocus,
        actionsConfig?.actionsAlign,
        actionsConfig?.autoFocusTargetAction
      );
    }
    // ouverture du dialog sans actions
    return this.dialogOpen<TR, KA>(title, content, dialogConfig);
  }

  openDialog<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR>;

  openDialog<TR extends ResultDialog.Close, KA extends PropertyKey>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR>;

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
  openDialog<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content
    // le dialogConfig va être récupérer dans le bon paramètre
    return this.dialogOpenActions<KA, KAF, TR>(content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign, title);
  }

  openDialogHtml<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR>;

  openDialogHtml<TR extends ResultDialog.Close, KA extends PropertyKey>(
    title: string | TitleConfig<string>,
    content: string | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR>;

  openDialogHtml<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content qui seront converti en objet MessageHtml
    return this.dialogOpenActions<KA, KAF, TR>(getDialogContentHtml(content), dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign, getDialogTitleHtml(title));
  }

  openDialogNoCloseButton<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>>;

  openDialogNoCloseButton<KA extends PropertyKey>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>>;

  openDialogNoCloseButton<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>> {
    // ajout du paramètre noCloseButton
    // on va appeler dialogOpen en passant le titre (en le convertissant en TitleConfig avec noCloseButton), le content sera appelé directement
    return this.dialogOpenActions<KA, KAF, never>(content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign, { title, noCloseButton: true });
  }

  openDialogConfig<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    config: NgxMgwDialogMatDialogConfig,
    actions?: Record<KA, string | DialogActionButton>,
    actionsConfig?: ActionsConfig<KA, KAF>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR> {
    // récupération des paramètres directement depuis l'objet config
    return this.dialogOpenActionsConfig<KA, KAF, TR>(config.title, config.content, config.dialogConfig, actions, actionsConfig);
  }

  openDialogConfigHtml<TR extends ResultDialog.Close, KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    config: NgxMgwDialogMatDialogConfig<string, string | Array<string | DialogContent<string & never>>, string>,
    actions?: Record<KA, string | DialogActionButton>,
    actionsConfig?: ActionsConfig<KA, KAF>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA> | TR> {
    // récupération des paramètres directement depuis l'objet config
    return this.dialogOpenActionsConfig<KA, KAF, TR>(getDialogTitleHtml(config.title), getDialogContentHtml(config.content), config.dialogConfig, actions, actionsConfig);
  }

  openDialogForm<
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>,
    TC extends { [K in keyof TC]: AbstractControl<unknown> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title?: string | TemplateRef<unknown> | TitleConfig,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, OnlyNonNumericStringKeys<KA> | TR>;

  openDialogForm<
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    TC extends { [K in keyof TC]: AbstractControl<unknown> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title: string | TemplateRef<unknown> | TitleConfig,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, OnlyNonNumericStringKeys<KA> | TR>;

  openDialogForm<
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>,
    TC extends { [P in keyof TC]: AbstractControl<unknown> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title?: string | TemplateRef<unknown> | TitleConfig,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, NgxMgwDialogMatDialogResult<TR, KA>> {
    // on rajoute les éléments du formulaire
    // récupération bonne valeur de dialogConfig et autoFocus
    // on teste si on a une valeur autoFocus dans le paramètre autoFocusOrDialogConfig
    if (isSimpleTypeValue(autoFocusOrDialogConfig)) {
      // autoFocusOrDialogConfig est l'autoFocus et dalogConfig est dans dalogConfig
      return this.dialogOpenForm<TC, KF, KFE, TR, KA, KAF>(title, content, formElems, formGroup, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
    }
    // autoFocusOrDialogConfig est le dialogConfig et on n'a pas d'autoFocus
    return this.dialogOpenForm<TC, KF, KFE, TR, KA>(title, content, formElems, formGroup, autoFocusOrDialogConfig, actions);
  }

  openDialogFormConfig<
    TR extends ResultDialog.Close,
    KA extends PropertyKey,
    KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>,
    TC extends { [P in keyof TC]: AbstractControl<unknown> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    config: Omit<NgxMgwDialogMatDialogConfig, 'content'>,
    actions?: Record<KA, string | DialogActionButton>,
    actionsConfig?: ActionsConfig<KA, KAF>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA, TC, KF, KFE>, OnlyNonNumericStringKeys<KA> | TR> {
    // récupération des paramètres directement depuis l'objet config
    if (actions) {
      // on a des actions
      return this.dialogOpenForm<TC, KF, KFE, TR, KA, KAF>(
        config.title,
        content,
        formElems,
        formGroup,
        config.dialogConfig,
        actions,
        actionsConfig?.autoFocus,
        actionsConfig?.actionsAlign,
        actionsConfig?.autoFocusTargetAction
      );
    }
    // ouverture du dialog sans actions
    return this.dialogOpenForm<TC, KF, KFE, TR, KA>(config.title, content, formElems, formGroup, config.dialogConfig);
  }

  openDialogNoTitle<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>>;

  openDialogNoTitle<KA extends PropertyKey>(
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<never>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>>;

  openDialogNoTitle<KA extends PropertyKey, KAF extends OnlyNonNumericStringKeys<KA> = OnlyNonNumericStringKeys<KA>>(
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, OnlyNonNumericStringKeys<KA>> {
    // ajout du paramètre noCloseButton
    // on va appeler dialogOpen en ne passant pas le titre, le content sera appelé directement
    return this.dialogOpenActions<KA, KAF, never>(content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
  }
}
