import { inject, Injectable, TemplateRef } from '@angular/core';

import { AutoFocusTarget, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

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

// first-tabbable :	Focus the first tabbable element. This is the default setting.
const AUTO_FOCUS_TARGET_FIRST_TABBABLE = 'first-tabbable';

const AUTO_FOCUS_TARGET_FIRST_ACTION = 'first-action';
const AUTO_FOCUS_TARGET_LAST_ACTION = 'last-action';

const AUTO_FOCUS_TARGET_ACTION = [AUTO_FOCUS_TARGET_FIRST_ACTION, AUTO_FOCUS_TARGET_LAST_ACTION] as const;

type AutoFocusTargetFirstLastAction = (typeof AUTO_FOCUS_TARGET_ACTION)[number];

type DialogConfigValue<KA extends KeyOfRecordActions> = Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>;

export type AutoFocusTargetAction = AutoFocusTarget | AutoFocusTargetFirstLastAction;

export interface TitleConfig<T extends string | MessageHtml | TemplateRef<unknown> = string | MessageHtml | TemplateRef<unknown>> {
  title: T;
  noCloseButton?: true;
}

export interface ActionsConfig<KA extends KeyOfRecordActions = string, KAF extends KA = KA> {
  actions: Record<KA, string | DialogActionButton>;
  autoFocus?: (KA & KAF) | boolean;
  autoFocusTargetAction?: AutoFocusTargetAction;
  actionsAlign?: DialogActionsAlignValues;
}

export interface NgxMgwDialogMatDialogConfig<
  KAction extends KeyOfRecordActions = string,
  KAutoFocus extends KAction = KAction,
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
  actionsConfig?: ActionsConfig<KAction, KAutoFocus>;
  dialogConfig?: DialogConfigValue<KAction>;
}

function isSimpleTypeValue(value: unknown): value is string | number | boolean | undefined {
  if (value === undefined || typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
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

function getAutoFocusValueButtonTarget<KA extends KeyOfRecordActions>(autoFocusValue: KA): string {
  return `button[name="btn-${autoFocusValue}"]`;
}

function getAutoFocusTargetActionValue<KA extends KeyOfRecordActions>(
  actions: Record<KA, string | DialogActionButton> | undefined,
  autoFocusTargetAction: AutoFocusTargetAction | undefined
): string {
  if (isAutoFocusTargetActionValue(autoFocusTargetAction)) {
    // récupération des actions
    const actionsKeys = actions ? Object.keys(actions) : undefined;
    const actionsKeysNb = actionsKeys?.length;
    if (actionsKeysNb) {
      // on a des actions on va renvoyer le nom du bouton (premier ou dernier)
      return getAutoFocusValueButtonTarget(autoFocusTargetAction === 'first-action' ? actionsKeys[0] : actionsKeys[actionsKeysNb - 1]);
    }
    // pas d'action on prendra l'action par défaut
    return AUTO_FOCUS_TARGET_FIRST_TABBABLE;
  }
  // on renvoit la valeur de autoFocusTargetAction
  return autoFocusTargetAction ?? AUTO_FOCUS_TARGET_FIRST_TABBABLE;
}

function getAutoFocusValue<KA extends KeyOfRecordActions>(autoFocus: KA | false): string | false {
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
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<KF & KFE>> | undefined,
    dialogConfig: DialogConfigValue<KA> | undefined,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    autoFocusTargetAction?: AutoFocusTargetAction,
    formElems?: Record<KF, DialogFormElemConfig>,
    formGroup?: FormGroup<TC>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération titre config (si title simple alors pas de noCloseButton)
    const titleConfig: TitleConfig | undefined =
      typeof title === 'string' || title instanceof TemplateRef ? ({ title } satisfies TitleConfig<string | TemplateRef<unknown>>) : title;

    const config: NgxMgwDialogMatDialogData<KA, T, TC, KF, KFE> = {
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

    return this.matDialog.open<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogData<KA, T, TC, KF, KFE>, NgxMgwDialogMatDialogResult<KA>>(
      NgxMgwDialogMatDialogComponent<KA>,
      {
        ...dialogConfig,
        data: config,
        autoFocus: autoFocusValue
      }
    );
  }

  private dialogOpenForm<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    dialogConfig: DialogConfigValue<KA> | undefined,
    actions?: Record<KA, string | DialogActionButton> | undefined,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    autoFocusTargetAction?: AutoFocusTargetAction
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // dialog avec formulaire et content
    const contentList = Array.isArray(content) ? content : [content];
    return this.dialogOpen(title, contentList, dialogConfig, actions, autoFocus, actionsAlign, autoFocusTargetAction, formElems, formGroup);
  }

  private dialogOpenActions<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>> | undefined,
    dialogConfig: DialogConfigValue<KA> | undefined,
    actions: Record<KA, string | DialogActionButton> | undefined,
    autoFocusOrDialogConfig: (KA & KAF) | boolean | DialogConfigValue<KA> | undefined,
    actionsAlign: DialogActionsAlignValues | undefined
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération bonne valeur de dialogConfig et autoFocus
    // on teste si on a une valeur autoFocus dans le paramètre autoFocusOrDialogConfig
    if (isSimpleTypeValue(autoFocusOrDialogConfig)) {
      // autoFocusOrDialogConfig est l'autoFocus et dalogConfig est dans dalogConfig
      return this.dialogOpen(title, content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
    }
    // autoFocusOrDialogConfig est le dialogConfig et on n'a pas d'autoFocus (et pas non plus d'autres paramètres pour les actions)
    return this.dialogOpen(title, content, autoFocusOrDialogConfig, actions);
  }

  private dialogOpenActionsConfig<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TemplateRef<unknown> | TitleConfig | undefined,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>> | undefined,
    dialogConfig: DialogConfigValue<KA> | undefined,
    actionsConfig: ActionsConfig<KA, KAF> | undefined
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    if (actionsConfig?.actions) {
      // on a des actions
      return this.dialogOpen(
        title,
        content,
        dialogConfig,
        actionsConfig.actions,
        actionsConfig.autoFocus,
        actionsConfig.actionsAlign,
        actionsConfig.autoFocusTargetAction
      );
    }
    // ouverture du dialog sans actions
    return this.dialogOpen(title, content, dialogConfig);
  }

  openDialog<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialog<KA extends KeyOfRecordActions>(
    title: string | TemplateRef<unknown> | TitleConfig,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
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
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content
    // le dialogConfig va être récupérer dans le bon paramètre
    return this.dialogOpenActions(title, content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
  }

  openDialogHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogHtml<KA extends KeyOfRecordActions>(
    title: string | TitleConfig<string>,
    content: string | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: Omit<MatDialogConfig<NgxMgwDialogMatDialogData<KA>>, 'data' | 'autoFocus'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | TitleConfig<string>,
    content?: string | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on va appeler dialogOpen en passant directement le titre et le content qui seront converti en objet MessageHtml
    return this.dialogOpenActions(getDialogTitleHtml(title), getDialogContentHtml(content), dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
  }

  openDialogNoCloseButton<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocus?: (KA & KAF) | boolean,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogNoCloseButton<KA extends KeyOfRecordActions>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions: Record<KA, string | DialogActionButton>,
    dialogConfig: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogNoCloseButton<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    title: string | MessageHtml | TemplateRef<unknown>,
    content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<string & never>>,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // ajout du paramètre noCloseButton
    // on va appeler dialogOpen en passant le titre (en le convertissant en TitleConfig avec noCloseButton), le content sera appelé directement
    return this.dialogOpenActions({ title, noCloseButton: true }, content, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
  }

  openDialogConfig<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    config: NgxMgwDialogMatDialogConfig<KA, KAF>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération des paramètres directement depuis l'objet config
    return this.dialogOpenActionsConfig(config.title, config.content, config.dialogConfig, config.actionsConfig);
  }

  openDialogConfigHtml<KA extends KeyOfRecordActions, KAF extends KA = KA>(
    config: NgxMgwDialogMatDialogConfig<KA, KAF, string, string | Array<string | DialogContent<string & never>>, string>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération des paramètres directement depuis l'objet config
    return this.dialogOpenActionsConfig(getDialogTitleHtml(config.title), getDialogContentHtml(config.content), config.dialogConfig, config.actionsConfig);
  }

  openDialogForm<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
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
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>>;

  openDialogForm<
    KA extends KeyOfRecordActions,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
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
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    title?: string | TemplateRef<unknown> | TitleConfig,
    actions?: Record<KA, string | DialogActionButton>,
    autoFocusOrDialogConfig?: (KA & KAF) | boolean | DialogConfigValue<KA>,
    actionsAlign?: DialogActionsAlignValues,
    dialogConfig?: DialogConfigValue<KA>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // on rajoute les éléments du formulaire
    // récupération bonne valeur de dialogConfig et autoFocus
    // on teste si on a une valeur autoFocus dans le paramètre autoFocusOrDialogConfig
    if (isSimpleTypeValue(autoFocusOrDialogConfig)) {
      // autoFocusOrDialogConfig est l'autoFocus et dalogConfig est dans dalogConfig
      return this.dialogOpenForm(title, content, formElems, formGroup, dialogConfig, actions, autoFocusOrDialogConfig, actionsAlign);
    }
    // autoFocusOrDialogConfig est le dialogConfig et on n'a pas d'autoFocus
    return this.dialogOpenForm(title, content, formElems, formGroup, autoFocusOrDialogConfig, actions);
  }

  openDialogFormConfig<
    KA extends KeyOfRecordActions,
    KAF extends KA = KA,
    T = unknown,
    TC extends { [K in keyof TC]: AbstractControl<T> } = never,
    KF extends keyof TC & string = never,
    KFE extends KF = KF
  >(
    content: DialogContent<KF & KFE> | Array<string | DialogContent<KF & KFE>>,
    formElems: Record<KF, DialogFormElemConfig>,
    formGroup: FormGroup<TC>,
    config: Omit<NgxMgwDialogMatDialogConfig<KA, KAF>, 'content'>
  ): MatDialogRef<NgxMgwDialogMatDialogComponent<KA>, NgxMgwDialogMatDialogResult<KA>> {
    // récupération des paramètres directement depuis l'objet config
    if (config.actionsConfig?.actions) {
      // on a des actions
      const actionsConfig: ActionsConfig<KA, KAF> = config.actionsConfig;
      return this.dialogOpenForm(
        config.title,
        content,
        formElems,
        formGroup,
        config.dialogConfig,
        actionsConfig.actions,
        actionsConfig.autoFocus,
        actionsConfig.actionsAlign,
        actionsConfig.autoFocusTargetAction
      );
    }
    // ouverture du dialog sans actions
    return this.dialogOpenForm(config.title, content, formElems, formGroup, config.dialogConfig);
  }
}
