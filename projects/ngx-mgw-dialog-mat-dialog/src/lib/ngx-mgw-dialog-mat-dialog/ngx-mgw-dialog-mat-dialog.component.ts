import { KeyValuePipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

const SVG_ICON_CLOSE = `
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
`;

const SVG_ICONS = {
  success: {
    name: 'check_circle_outline',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px">
        <path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/>
        <path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>
    `,
    aria: 'Image réussite'
  },
  info: {
    name: 'info_outline',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="20px" viewBox="0 0 24 24" width="20px">
        <g>
          <path d="M0,0h24v24H0V0z" fill="none"/>
          <path d="M11,7h2v2h-2V7z M11,11h2v6h-2V11z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20 c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
        </g>
      </svg>
    `,
    aria: 'Image information'
  },
  question: {
    name: 'help_outline',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
      </svg>
    `,
    aria: 'Image question'
  },
  error: {
    name: 'error_outline',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>
    `,
    aria: 'Image erreur'
  },
  warning: {
    name: 'warning_amber',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="20px" viewBox="0 0 24 24" width="20px">
        <g>
          <rect fill="none" height="24" width="24"/>
        </g>
        <g><g><g>
          <path d="M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2z"/>
          <polygon points="13,16 11,16 11,18 13,18"/>
          <polygon points="13,10 11,10 11,15 13,15"/>
        </g></g></g>
      </svg>
    `,
    aria: 'Image avertissement'
  }
};

const MESSAGE_TYPE_STYLE_VALUES = [
  { style: 'none', icon: undefined, color: undefined },
  { style: 'success', icon: SVG_ICONS.success, color: '#1FAB4C' },
  { style: 'info', icon: SVG_ICONS.info, color: undefined },
  { style: 'question', icon: SVG_ICONS.question, color: undefined },
  { style: 'error', icon: SVG_ICONS.error, color: '#EC2213' },
  { style: 'warning', icon: SVG_ICONS.warning, color: '#F0890C' }
] as const;

const ACTION_ALIGN_END = 'end';

const ACTIONS_ALIGN_VAL = ['center', 'start', ACTION_ALIGN_END] as const;

const INPUT_TYPE_TEXT = 'text';
const INPUT_TYPE_TEXTAREA = 'textarea';
const INPUT_TYPE_CHECKBOX = 'checkbox';

type KeyOfRecord = string | number | symbol;

export type KeyOfRecordActions = Exclude<KeyOfRecord, symbol>;

/**
 * Types prédéfinis pour le style du message.
 * Chaque style correspond à un thème visuel spécifique (couleur, icône) :
 * - 'none' : aucun style
 * - 'success' : style pour message de réussite avec icône check et couleur verte
 * - 'info' : style pour message information avec icône info
 * - 'question' : style pour message question avec icône help
 * - 'error' : style pour message erreur avec icône error et couleur rouge
 * - 'warning' : style pour message avertissement avec icône warning et couleur orange
 */
export type MessageTypeStyle = (typeof MESSAGE_TYPE_STYLE_VALUES)[number]['style'];

/**
 * Définit le type, le style et les options d'affichage d'un message.
 * Cette interface permet de configurer l'apparence visuelle du message,
 * notamment l'icône et la gestion des couleurs associées au style.
 */
export interface MessageType {
  /**
   * Style visuel du message (none, info, success, error, warning, question).
   * Détermine le thème appliqué (couleur, icône).
   * @example "success", "warning", "info"
   * @see {@link MessageTypeStyle}
   */
  style: MessageTypeStyle;

  /**
   * Indique si une icône doit être affichée avec le message.
   * - `true` : Affiche une icône associée au style (check (success), warning, info, error, help (question)). Par omission (valeur `undefined`), l'icône du style est affichée.
   * - `false` : Aucune icône n'est affichée.
   * @default undefined true
   */
  icon?: boolean;

  /**
   * Indique si les couleurs par défaut du style doivent être désactivées.
   * - `true` : Le message n'utilisera pas les couleurs associées au `style`.
   * - `false` : Par omission les couleurs par défaut du style seront appliquées.
   * @default undefined false (par omission, les couleurs du style sont appliquées)
   */
  noColor?: true;
}

/** Représente un message qui peut être soit du texte brut, soit du contenu HTML déjà formaté. */
export interface MessageHtml {
  /**
   * Le contenu du message.
   * @remarks
   * - Si {@link isHtml} vaut `true`, la chaîne sera affichée en interprétant l'HTML.
   * - Si {@link isHtml} vaut `false`, la chaîne sera traitée comme du texte brut.
   */
  contenu: string;

  /**
   * Indique si le champ {@link contenu} contient du HTML.
   * - `true` : le texte doit être interprété comme du HTML (ex. `[innerHTML]="message"`).
   * - `false` : le texte doit être affiché tel quel (ex. `{{ message }}`).
   * @default false
   */
  isHtml: boolean;
}

/**
 * Représente un message qui peut être soit du texte brut, soit du contenu HTML déjà formaté avec paramétrage de la couleur et de l'alignement du texte.
 * {@link MessageHtml}
 */
export interface MessageHtmlParam extends MessageHtml {
  /**
   * Style du message ou type du message.
   *
   * Soit une chaîne de caractères de type `MessageTypeStyle` pour un style prédéfini :
   * - 'none' : aucun style
   * - 'success' : style pour message de réussite avec icône check et couleur verte
   * - 'info' : style pour message information avec icône info
   * - 'question' : style pour message question avec icône help
   * - 'error' : style pour message erreur avec icône error et couleur rouge
   * - 'warning' : style pour message avertissement avec icône warning et couleur orange
   *
   * soit un objet de configuration du style de type `MessageType` permettant de définir le style prédéfini voulu (icône et couleur).
   * @example "none", "success", "warning", "info"
   * @default undefined "none"
   * @see {@link MessageTypeStyle}
   * @see {@link MessageType}
   */
  type?: MessageTypeStyle | MessageType;

  /**
   * Couleur personnalisée du texte.
   * Accepte une valeur CSS valide (ex: "#ffffff", "yellow", "rgba(180, 196, 40, 0.87)").
   * Cette couleur prendra le dessus sur la couleur du style du message.
   * @example "#c5dfaf"
   * @default undefined
   */
  labelColor?: string;

  textAlign?: 'start' | 'end' | 'center' | 'justify';
}

export interface DialogContent<K extends string = string> {
  subtitle?: string;
  rubrique?: string | MessageHtmlParam;
  formElem?: K | K[];
}

interface DialogContentTexteHtmlRubriqueStyle {
  color?: string;
  'text-align'?: string;
}

interface RubriqueFormElemConfigStyle {
  width?: string;
  'max-width'?: string;
}

export interface DialogFormElemConfigValues<TValue = unknown, TTexte extends string | number = string> {
  texte: TTexte;
  value: TValue;
}

export interface DialogFormElemConfig {
  label?: string;
  hintText?: string;
  placeholder?: string;
  errorLabel?: string;
  textPrefix?: string;
  textSuffix?: string;
  inputType?:
    | typeof INPUT_TYPE_TEXT
    | 'number'
    | 'email'
    | 'tel'
    | 'password'
    | 'url'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'month'
    | 'week'
    | 'time'
    | typeof INPUT_TYPE_TEXTAREA
    | typeof INPUT_TYPE_CHECKBOX;
  maxlength?: number;
  readonly?: boolean;
  width?: string;
  maxWidth?: string;
  labelPosition?: 'before';
  isSelect?: true | 'multiple';
  values?: DialogFormElemConfigValues[];
  selectResetText?: false | string;
}

interface RubriqueFormElemConfig<K extends string> extends Omit<DialogFormElemConfig, 'width'> {
  formElemName: K;
  contentIndex: number;
  style?: RubriqueFormElemConfigStyle;
}

interface DialogContentTexteHtmlRubriqueIcone {
  icon: string;
  aria: string;
}

/** {@link DialogContent} */
interface DialogContentTexteHtml<K extends string> {
  subtitle: string | undefined;
  rubriqueTexte?: string;
  rubriqueHtml?: SafeHtml;
  rubriqueStyle?: DialogContentTexteHtmlRubriqueStyle;
  rubriqueIcone?: DialogContentTexteHtmlRubriqueIcone;
  formElems: ReadonlyArray<RubriqueFormElemConfig<K>> | undefined;
}

export interface DialogActionButton {
  libelle: string;
  color?: 'warn' | 'primary' | 'accent';
  noFocus?: true;
  disabledIfFormInvalid?: true;
}

/** {@link DialogActionButton} */
interface DialogActionButtonData extends Omit<DialogActionButton, 'noFocus'> {
  tabindex: 0 | -1;
}

export type DialogActionsAlignValues = (typeof ACTIONS_ALIGN_VAL)[number];

export interface NgxMgwDialogMatDialogData<
  KAction extends KeyOfRecordActions = string,
  TValue = unknown,
  TControl extends { [K in keyof TControl]: AbstractControl<TValue> } = never,
  KForm extends keyof TControl & string = never,
  KFormElem extends KForm = KForm
> {
  title?: string | MessageHtml | TemplateRef<unknown>;
  content?: string | MessageHtml | TemplateRef<unknown> | Array<string | DialogContent<KFormElem>>;
  actions?: Record<KAction, string | DialogActionButton>;
  actionsAlign?: DialogActionsAlignValues;
  noCloseButton?: true;
  formElems?: Record<KForm, DialogFormElemConfig>;
  formGroup?: FormGroup<TControl>;
}

export const enum ResultDialog {
  None,
  Ok,
  Cancel,
  Abort,
  Retry,
  Ignore,
  Yes,
  No,
  All,
  NoToAll,
  YesToAll,
  Close
}

export interface NgxMgwDialogMatDialogResult<KAction extends KeyOfRecordActions = string> {
  action?: KAction;
  result: ResultDialog;
}

export function isMessageHtml(value: unknown): value is MessageHtml {
  if (typeof value === 'object' && value !== null && 'contenu' in value && typeof value.contenu === 'string' && 'isHtml' in value && typeof value.isHtml === 'boolean') {
    return true;
  }
  return false;
}

/**
 * Récupère un tableau de tubles [clé, valeur] (`[K, V]`) à partir d'un `Record` ou d'un objet `Map`
 * @param {Record<K, V> | Map<K, V> | undefined} recOrMap `Record` ou objet `Map` (`K` est d'un type qui étend `string`, `number` ou `symbol`)
 * @returns {Array<[K, V]> | undefined} Tableau de pair clé valeur ou `undefined` (si param {@link recOrMap} est `undefined`)
 */
function getObjectEntries<K extends KeyOfRecord, V>(recOrMap: Record<K, V> | Map<K, V> | undefined): Array<[K, V]> | undefined {
  if (recOrMap === undefined) {
    // undefined
    return undefined;
  }
  if (recOrMap instanceof Map) {
    // objet Map on crée le tableau avec le constructeur de tableau
    return Array.from(recOrMap);
  }
  // pas objet Map donc Record on va créer le tableau à l'aide d'Object
  // Object.entries renvoie un tableau de tuples [clé, valeur]
  return Object.entries(recOrMap) as Array<[K, V]>;
}

function isStringNotEmpty(value: string | undefined): boolean {
  if (value !== '' && value !== undefined) {
    return true;
  }
  return false;
}

function objectIsMessageType(value: unknown): value is MessageType {
  // On teste si la valeur est un objet et si elle n'est pas null (la valeur null est de type object)
  // si l'objet contient les champs style et icon et que les types et valeurs possibles correspondent alors on considère que l'objet est de type MessageType
  if (typeof value === 'object' && value !== null && 'style' in value && MESSAGE_TYPE_STYLE_VALUES.some((mtsv) => mtsv.style === value.style)) {
    return true;
  }
  return false;
}

function getMessageTypeStyle(messageTypeStyle: MessageTypeStyle | MessageType): MessageType {
  const messageType: MessageType = objectIsMessageType(messageTypeStyle) ? messageTypeStyle : { style: messageTypeStyle, icon: true };
  return messageType;
}

function getRubriqueDialogContentTexteHtml<K extends string>(
  rubriqueMessageParam: MessageHtmlParam | undefined
): Pick<DialogContentTexteHtml<K>, 'rubriqueStyle' | 'rubriqueIcone'> {
  // si on n'a pas de couleur forcé on prend la couleur sur le type
  const messageType: MessageType | undefined = rubriqueMessageParam?.type ? getMessageTypeStyle(rubriqueMessageParam.type) : undefined;
  const messageTypeStyle = messageType ? MESSAGE_TYPE_STYLE_VALUES.find((mtsv) => mtsv.style === messageType.style) : undefined;
  const messageTypeStyleColor = messageType?.noColor === true ? undefined : messageTypeStyle?.color;
  const color = rubriqueMessageParam?.labelColor ?? messageTypeStyleColor;
  const messageTypeStyleIcon = messageType?.icon === false ? undefined : messageTypeStyle?.icon;
  // mise en place style rubrique si couleur ou alignement défini
  return {
    rubriqueStyle: {
      color,
      'text-align': rubriqueMessageParam?.textAlign
    },
    rubriqueIcone: messageTypeStyleIcon ? { icon: messageTypeStyleIcon.name, aria: messageTypeStyleIcon.aria } : undefined
  };
}

@Component({
  selector: 'lib-ngx-mgw-dialog-mat-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    KeyValuePipe,
    MatIconModule,
    NgTemplateOutlet,
    NgStyle,
    ReactiveFormsModule
  ],
  templateUrl: './ngx-mgw-dialog-mat-dialog.component.html',
  styleUrl: './ngx-mgw-dialog-mat-dialog.component.scss'
})
export class NgxMgwDialogMatDialogComponent<
  KA extends KeyOfRecordActions = string,
  T = unknown,
  TC extends { [K in keyof TC]: AbstractControl<T> } = never,
  KF extends keyof TC & string = never,
  KFE extends KF = KF
> {
  readonly dialogRef: MatDialogRef<NgxMgwDialogMatDialogComponent<KA, T, TC, KF, KFE>, NgxMgwDialogMatDialogResult<KA>> = inject(
    MatDialogRef<NgxMgwDialogMatDialogComponent<KA, T, TC, KF, KFE>, NgxMgwDialogMatDialogResult<KA>>
  );
  readonly data: NgxMgwDialogMatDialogData<KA, T, TC, KF, KFE> | null | undefined = inject<NgxMgwDialogMatDialogData<KA, T, TC, KF, KFE> | null | undefined>(
    MAT_DIALOG_DATA
  );

  private readonly sanitizer = inject(DomSanitizer);

  private readonly dataFormElems: ReadonlyMap<KF, DialogFormElemConfig>;

  readonly actionAlignEnd = ACTION_ALIGN_END;

  readonly inputTypeText = INPUT_TYPE_TEXT;
  readonly inputTypeTextarea = INPUT_TYPE_TEXTAREA;
  readonly inputTypeCheckbox = INPUT_TYPE_CHECKBOX;

  readonly labelPositionAfter = 'after';

  readonly dataFormGroup: FormGroup;

  readonly dataTitleTexte: string | undefined;
  readonly dataTitleHtml: SafeHtml | undefined;
  readonly dataTitleTemplate: TemplateRef<unknown> | undefined;

  readonly dataContentTexte: string | undefined;
  readonly dataContentHtml: SafeHtml | undefined;
  readonly dataContentTemplate: TemplateRef<unknown> | undefined;
  readonly dataContent: ReadonlyArray<DialogContentTexteHtml<KFE>> | undefined;

  readonly dataActions: ReadonlyMap<KA, DialogActionButtonData> | undefined;

  hasContent: boolean = false;

  constructor() {
    // génération icones svg
    const iconRegistry = inject(MatIconRegistry);
    iconRegistry.addSvgIconLiteral('close', this.sanitizer.bypassSecurityTrustHtml(SVG_ICON_CLOSE));
    MESSAGE_TYPE_STYLE_VALUES.forEach((ico) => {
      if (ico.icon) {
        iconRegistry.addSvgIconLiteral(ico.icon.name, this.sanitizer.bypassSecurityTrustHtml(ico.icon.icon));
      }
    });

    // mises en place du taleau des éléments de formulaire
    this.dataFormElems = new Map(getObjectEntries(this.data?.formElems));

    // récupération formulaire (si pas présent on en crée un vide puisqu'on ne peut pas avoir de valeur undefined)
    this.dataFormGroup = this.data?.formGroup ?? new FormGroup({});

    // mise en place du titre
    if (this.data?.title instanceof TemplateRef) {
      // template on remplit la variable du template du dialog titre
      this.dataTitleTemplate = this.data.title;
    } else {
      // on a soit un contenu chaine (qui peut être vide) soit un MessageHtml (avec contenu qui peut être vide)
      const dataMessageContent = this.data?.title;
      if (typeof dataMessageContent !== 'string' && dataMessageContent?.contenu && dataMessageContent.isHtml) {
        // MessageHtml avec contenu pas vide et formaté en html (isHtml = true) on remplit la variable de titre en html
        this.dataTitleHtml = this.sanitizer.bypassSecurityTrustHtml(dataMessageContent.contenu);
      } else if (dataMessageContent && (typeof dataMessageContent === 'string' || dataMessageContent.contenu)) {
        // contenu chaine (non vide) ou MessageHtml avec contenu non vide et pas formaté en html on remplit la variable de texte du dialog title
        this.dataTitleTexte = typeof dataMessageContent === 'string' ? dataMessageContent : dataMessageContent.contenu;
      }
    }

    if (this.dataTitleHtml || this.dataTitleTexte || this.dataTitleTemplate) {
      this.hasContent = true;
    }

    // mise en place du contenu
    if (this.data?.content instanceof TemplateRef) {
      // template on remplit la variable du template du contenu du dialog
      this.dataContentTemplate = this.data.content;
    } else if (isMessageHtml(this.data?.content) && this.data.content.contenu && this.data.content.isHtml) {
      // MessageHtml avec contenu pas vide et formaté en html (isHtml = true) on remplit la variable de contenu en html
      this.dataContentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.content.contenu);
    } else if (this.data?.content === undefined || typeof this.data.content === 'string' || isMessageHtml(this.data.content)) {
      // si on a undefined ou un string ou un MessageHtml on va tester s'il sont remplis et sinon on fait rien
      // on a soit un contenu chaine (qui peut être vide) soit un MessageHtml (avec contenu qui peut être vide ou pas formaté en html)
      // vérification qu'on ait bien un contenu
      if (this.data?.content && (typeof this.data.content === 'string' || this.data.content.contenu)) {
        // contenu chaine (non vide) ou MessageHtml avec contenu non vide et pas formaté en html on remplit la variable de texte du dialog content
        this.dataContentTexte = typeof this.data.content === 'string' ? this.data.content : this.data.content.contenu;
      }
    } else {
      // c'est un tableau contenant des DialogContent ou des string (si celui-ci est vide on ne doit pas remplir la variable)
      // on va le convertir en tableau de DialogContentTexteHtml (si celui-ci est vide on ne doit pas remplir la variable)
      const dataContents: ReadonlyArray<DialogContentTexteHtml<KFE>> = this.data.content.map<DialogContentTexteHtml<KFE>>((val, i) => {
        const valContent: DialogContent<KFE> = typeof val === 'string' ? { rubrique: val } : val;
        return this.convertDialogContentRubriqueToTexteHtml(valContent, i);
      });
      if (dataContents.some((v) => isStringNotEmpty(v.subtitle) || isStringNotEmpty(v.rubriqueTexte) || v.rubriqueHtml !== undefined)) {
        // tableau non vide avec des valeurs c'est ok on remplit
        this.dataContent = dataContents;
        this.hasContent = true;
      }
    }

    if (this.dataContentHtml || this.dataContentTexte || this.dataContentTemplate) {
      this.hasContent = true;
    }

    // mises en place du taleau des boutons d'actions
    const actionsEntries = getObjectEntries(this.data?.actions);
    if (actionsEntries?.length) {
      this.hasContent = true;
      this.dataActions = new Map(
        actionsEntries
          .map<[KA, DialogActionButton]>((pair) => {
            const actionEntryData: string | DialogActionButton = pair[1];
            return [pair[0], typeof actionEntryData === 'string' ? { libelle: actionEntryData } : actionEntryData];
          })
          .map<[KA, DialogActionButtonData]>((pairObj) => {
            const actionButton: DialogActionButton = pairObj[1];
            return [pairObj[0], { ...actionButton, tabindex: actionButton.noFocus === true ? -1 : 0 }];
          })
      );
    }
  }

  private getRubriqueFormElemConfig<K extends KFE>(formElem: K, index: number): RubriqueFormElemConfig<K> {
    const retRubriqueFormElemConfig: RubriqueFormElemConfig<K> = {
      formElemName: formElem,
      contentIndex: index
    };
    const dialogFormElemConfig: DialogFormElemConfig | undefined = this.dataFormElems.get(formElem);
    if (dialogFormElemConfig) {
      return {
        ...retRubriqueFormElemConfig,
        ...dialogFormElemConfig,
        style: { width: dialogFormElemConfig.width, 'max-width': dialogFormElemConfig.maxWidth }
      };
    }
    return retRubriqueFormElemConfig;
  }

  private convertDialogContentRubriqueToTexteHtml<K extends KFE>(dialogContent: DialogContent<K>, index: number): DialogContentTexteHtml<K> {
    const dialogContentFormElem: K | K[] = dialogContent.formElem ?? [];
    const formElemsConfig: Array<RubriqueFormElemConfig<K>> = Array.isArray(dialogContentFormElem)
      ? dialogContentFormElem.map<RubriqueFormElemConfig<K>>((fe) => this.getRubriqueFormElemConfig(fe, index))
      : [this.getRubriqueFormElemConfig(dialogContentFormElem, index)];
    const resuTexteHtml: DialogContentTexteHtml<K> = {
      subtitle: dialogContent.subtitle,
      formElems: formElemsConfig.filter((fef) => this.data?.formGroup?.get(fef.formElemName))
    };
    const resuTexteHtmlStyleIcon: DialogContentTexteHtml<K> =
      typeof dialogContent.rubrique === 'string'
        ? resuTexteHtml
        : {
            ...resuTexteHtml,
            ...getRubriqueDialogContentTexteHtml(dialogContent.rubrique)
          };
    if (typeof dialogContent.rubrique !== 'string' && dialogContent.rubrique?.contenu && dialogContent.rubrique.isHtml) {
      const rubriqueHtml = this.sanitizer.bypassSecurityTrustHtml(dialogContent.rubrique.contenu);
      return {
        ...resuTexteHtmlStyleIcon,
        rubriqueHtml
      };
    }
    return {
      ...resuTexteHtmlStyleIcon,
      rubriqueTexte: typeof dialogContent.rubrique === 'string' ? dialogContent.rubrique : dialogContent.rubrique?.contenu
    };
  }

  noKeyvalueSort(): number {
    return 0;
  }

  onActionClick(key: KA): void {
    this.dialogRef.close({
      action: key,
      result: ResultDialog.None
    });
  }

  onCloseClick(): void {
    this.dialogRef.close({
      result: ResultDialog.Close
    });
  }
}
