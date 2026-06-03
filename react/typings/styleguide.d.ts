import type {
  ChangeEvent,
  ComponentType,
  FocusEvent,
  MouseEvent,
  ReactNode,
} from 'react'
import React from 'react'

declare module 'vtex.styleguide' {
  // Propriedades para o Collapsible
  interface CollapsibleProps {
    children: React.ReactNode
    header: React.ReactNode
    align?: 'right' | 'left'
    arrowAlign?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
    caretColor?: string
    isOpen?: boolean
    isOverflowHidden?: boolean
    muted?: boolean
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  }

  // Propriedades para o Button
  interface ButtonProps {
    children: React.ReactNode
    autoComplete?: string
    autoFocus?: boolean
    block?: boolean
    disabled?: boolean
    download?: string
    href?: string
    icon?: boolean
    id?: string
    isActiveOfGroup?: boolean
    isFirstOfGroup?: boolean
    isGrouped?: boolean
    isLastOfGroup?: boolean
    isLoading?: boolean
    name?: string
    noUpperCase?: boolean
    noWrap?: boolean
    onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
    onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseOut?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseOver?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onTouchEnd?: (event: React.TouchEvent<HTMLButtonElement>) => void
    onTouchMove?: (event: React.TouchEvent<HTMLButtonElement>) => void
    onTouchStart?: (event: React.TouchEvent<HTMLButtonElement>) => void
    referrerPolicy?: string
    rel?: string
    size?: 'small' | 'regular' | 'large'
    tabIndex?: number
    target?: string
    testId?: string
    type?: string
    value?: string
    variation?:
      | 'primary'
      | 'secondary'
      | 'tertiary'
      | 'inverted-tertiary'
      | 'danger'
      | 'danger-tertiary'
  }

  type DropdownOption = {
    disabled: boolean
    value: string | number // union type: string or number
    label: string | number // union type: string or number
  }

  type DropdownSize = 'small' | 'regular' | 'large'
  type DropdownVariation = 'default' | 'inline'

  interface DropdownProps {
    autoFocus?: boolean // Spec attribute
    disabled?: boolean // Spec attribute
    error?: boolean // Error highlight
    errorMessage?: ReactNode // Error message
    form?: string // Spec attribute
    helpText?: ReactNode // Help text
    id?: string // Spec attribute
    label?: ReactNode // Dropdown label
    name?: string // Spec attribute

    onBlur?: (event: FocusEvent<HTMLSelectElement>) => void // onBlur event
    onChange?: (event: ChangeEvent<HTMLSelectElement>, value: string) => void // onChange event
    onFocus?: (event: FocusEvent<HTMLSelectElement>) => void // onFocus event
    onMouseEnter?: (event: MouseEvent<HTMLSelectElement>) => void // onMouseEnter event
    onMouseLeave?: (event: MouseEvent<HTMLSelectElement>) => void // onMouseLeave event

    options?: DropdownOption[] // Dropdown options list (shape[])
    placeholder?: string | number // Dropdown placeholder value (union of string or number)
    preventTruncate?: boolean // Prevent truncating large option texts
    required?: boolean // Spec attribute
    selectTestId?: string // Data attribute for select
    size?: DropdownSize // Dropdown size (enum: 'small', 'regular', 'large')
    testId?: string // Data attribute
    value?: string | number // Selected value (union of string or number)
    variation?: DropdownVariation // Dropdown variation (enum: 'default', 'inline')
  }

  interface SpinnerProps {
    block?: boolean // Define se o display deve ser block
    color?: string // Cor do spinner
    size?: number // Tamanho (diâmetro) do spinner, padrão é 40
  }

  interface CheckboxProps {
    id?: string // Required: Unique identifier for the checkbox
    name?: string // Required: Name of the checkbox
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void // Required: Function to handle change events
    checked?: boolean // Optional: Indicates if the checkbox is checked (default: false)
    disabled?: boolean // Optional: Indicates if the checkbox is disabled (default: false)
    label?: React.ReactNode // Optional: Label for the checkbox
    partial?: boolean // Optional: Indicates if the checkbox is in a partial state (default: false)
    required?: boolean // Optional: Indicates if the checkbox is required (default: false)
    value?: string // Optional: Value of the checkbox
  }

  interface TableItem {}

  interface TableSchema {}

  interface TableProps {
    schema: TableSchema
    items: TableItem[]
    indexColumn?: boolean
    emptyStateLabel?: string
    pagination?: {
      onNextClick: () => void
      onPrevClick: () => void
      currentItemFrom: number
      currentItemTo: number
      onRowsChange: (any: any, value: any) => void
      rowsOptions?: number[]
      totalItems: number
      textShowRows?: string
      textOf?: string
      textItemsPerPage?: string
      textAllRows?: string
    }
  }

  // Declaração dos componentes
  export const Collapsible: React.FC<CollapsibleProps>
  export const Button: React.FC<ButtonProps>
  export const Dropdown: React.FC<DropdownProps>
  export const Spinner: React.FC<SpinnerProps>
  export const Checkbox: React.FC<CheckboxProps>
  export const Table: React.FC<TableProps>
  interface ToastMessage {
    message: string
  }

  export interface WithToastProps {
    showToast: (params: ToastMessage) => void
  }

  type WithToast = <P extends object>(
    WrappedComponent: ComponentType<P & WithToastProps>
  ) => ComponentType<P>

  export const withToast: WithToast

  type InputProps = {
    accept?: string // Spec attribute
    autoComplete?: string // Spec attribute
    autoCorrect?: string // Spec attribute
    autoFocus?: boolean // Spec attribute, default: false
    autoSave?: string // Spec attribute
    dataAttributes?: { [key: string]: any } // List of data attributes as an object
    defaultValue?: string // Spec attribute
    disabled?: boolean // Spec attribute, default: false
    error?: boolean // Error highlight, default: false
    errorMessage?: string // Error message
    groupBottom?: boolean // Whether the border should join with an element below
    helpText?: React.ReactNode // Help text
    id?: string // Spec attribute
    inputMode?: string // Spec attribute
    label?: string | React.ReactNode // Label, can be string or element
    list?: string // Spec attribute
    max?: string // Spec attribute
    maxLength?: number | string // Spec attribute, can be number or string
    min?: string // Spec attribute
    minLength?: string // Spec attribute
    multiple?: boolean // Spec attribute, default: false
    name?: string // Spec attribute
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void // onBlur event
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void // onChange event
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void // onFocus event
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void // onKeyDown event
    onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void // onKeyPress event
    onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void // onKeyUp event
    onMouseEnter?: (event: React.MouseEvent<HTMLInputElement>) => void // onMouseEnter event
    onMouseLeave?: (event: React.MouseEvent<HTMLInputElement>) => void // onMouseLeave event
    pattern?: string // Spec attribute
    placeholder?: string // Spec attribute
    prefix?: React.ReactNode // Prefix
    readOnly?: boolean // Spec attribute, default: false
    required?: boolean // Spec attribute
    size?: 'small' | 'regular' | 'large' // Input size
    spellCheck?: string // Spec attribute
    src?: string // Spec attribute
    step?: string // Spec attribute
    suffix?: React.ReactNode // Suffix attribute
    suffixIcon?: React.ReactNode // DEPRECATED: Suffix icon attribute
    tabIndex?: string // Spec attribute
    testId?: string // Data attribute
    token?: boolean // If the input is an API Key, App Key or App Token, default: false
    type?: string // Spec attribute, default: 'text'
    value?: string | number // Spec attribute
  }

  type TextareaProps = {
    autoComplete?: string // Spec attribute
    autoFocus?: boolean // Spec attribute, default: false
    characterCountdownText?: string // Helper text for character countdown, default: 'characters left'
    children?: string // Content of the textarea
    dataAttributes?: { [key: string]: any } // List of data attributes as an object
    defaultValue?: string // Default content of the textarea
    disabled?: boolean // Spec attribute, default: false
    error?: boolean // Error highlight, default: false
    errorMessage?: string // Error message
    helpText?: React.ReactNode // Help text
    id?: string // Spec attribute
    label?: string | React.ReactNode // Label, can be string or element
    maxLength?: number // If defined, the textarea will have a character countdown
    minLength?: string // Spec attribute
    name?: string // Spec attribute
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void // onBlur event
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void // onChange event
    onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void // onFocus event
    placeholder?: string // Spec attribute
    readOnly?: boolean // Spec attribute, default: false
    required?: boolean // Spec attribute
    resize?: 'both' | 'horizontal' | 'none' | 'vertical' // Controls if Textarea is resizable
    rows?: number // Spec attribute, default: 5
    size?: 'small' | 'regular' | 'large' // One of: small, regular, large
    spellCheck?: string // Spec attribute
    value?: string // Controlled content of the textarea
    wrap?: string // Spec attribute
  }

  type OptionValue = number | string

  interface Option {
    value: OptionValue
    label: React.ReactNode
    disabled?: boolean
  }

  type Size = 'small' | 'regular' | 'large'

  interface RadioGroupProps {
    name: string
    onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
    options: Option[]
    disabled?: boolean
    error?: boolean
    errorMessage?: string
    hideBorder?: boolean
    label?: string | React.ReactElement
    size?: Size
    testId?: string
    value?: OptionValue
  }

  interface CheckedItem {
    label: string
    checked: boolean
  }

  // Definição do tipo para o checkedMap
  interface CheckedMap {
    [key: string]: CheckedItem
  }

  // Propriedades do componente CheckboxGroup
  interface CheckboxGroupProps {
    id: string
    name: string
    onGroupChange: (checkedMap: CheckedMap) => void
    value: string
    checkedMap: CheckedMap
    disabled?: boolean
    label?: string
    padded?: boolean
  }

  interface ModalProps {
    /** Content of the modal */
    children: ReactNode // Required

    /** Callback fired when modal is requested to be closed */
    onClose: () => void // Required

    /** Node to be displayed as the bottom bar of the modal */
    bottomBar?: ReactNode

    /** Center the modal (for small content) */
    centered?: boolean

    /** Close the modal on ESC key press (default true) */
    closeOnEsc?: boolean

    /** Close the modal on overlay click (default true) */
    closeOnOverlayClick?: boolean

    /** Container in which the modal is rendered */
    container?: object

    /** Show or hide the modal (default false) */
    isOpen?: boolean

    /** Event fired when the closing transition is finished */
    onCloseTransitionFinish?: () => void

    /** Expand modal to fullscreen in small viewports (e.g., mobile) */
    responsiveFullScreen?: boolean

    /** Show BottomBar border (default true) */
    showBottomBarBorder?: boolean

    /** Show the close icon on the upper right corner (default true) */
    showCloseIcon?: boolean

    /** If true, show top bar with title */
    showTopBar?: boolean

    /** Modal title to be displayed at the top of the modal */
    title?: ReactNode
  }

  type AlertType = 'success' | 'error' | 'warning'

  interface AlertAction {
    onClick: () => void // Função obrigatória chamada ao clicar no botão de ação
    label: ReactNode // Rótulo obrigatório exibido no botão de ação
  }

  interface AlertProps {
    children: ReactNode // Conteúdo do alerta (obrigatório)
    type: AlertType // Estilo do alerta (obrigatório, enum)
    action?: AlertAction // Objeto para configurar o botão de ação (opcional)
    autoClose?: number // Tempo em milissegundos para fechar automaticamente (opcional)
    closeIconLabel?: string // Título exibido ao passar o mouse sobre o ícone de fechar (opcional)
    focusOnOpen?: boolean // Define se deve focar no primeiro elemento focável ao abrir (opcional)
    onClose?: () => void // Função chamada ao fechar o alerta (opcional)
  }

  type SizeOption = 'small' | 'regular' | 'large'

  interface NumericStepperInputProps {
    onChange: (event: { value: number }) => void
    block?: boolean // default: false
    defaultValue?: number // default: 0
    label?: string
    lean?: boolean
    maxValue?: number // default: Infinity
    minValue?: number // default: 0
    readOnly?: boolean // default: false
    size?: SizeOption // default: 'regular'
    suffix?: string
    unitMultiplier?: number // default: 1
    value?: number
  }

  interface LayoutProps {
    children: ReactNode
    pageHeader: ReactNode
  }

  interface PageBlockProps {
    children: ReactNode
    variation?: 'full' | 'card'
  }

  interface PageHeaderProps {
    title: string
    linkLabel?: string
    onLinkClick?: () => void
    buttonLabel?: string
    onButtonClick?: () => void
    children?: ReactNode
    subtitle?: string
  }

  interface ButtonWithIconProps {
    variation?: 'primary' | 'secondary' | 'tertiary' | 'danger-tertiary'
    icon: ReactNode
    size?: 'small' | 'regular' | 'large'
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }

  interface IconEdit {
    size?: number
  }

  interface IconDelete {
    size?: number
  }

  interface IconPlus {
    size?: number
  }

  interface ToggleProps {
    checked?: boolean
    disabled?: boolean
    helpText?: ReactNode
    id?: string
    label?: string
    onChange?: (...args: any[]) => void
    onClick?: (...args: any[]) => void
    semantic?: boolean
    size?: 'small' | 'regular'
  }

  export const Input: React.FC<InputProps>
  export const Textarea: React.FC<TextareaProps>
  export const RadioGroup: React.FC<RadioGroupProps>
  export const CheckboxGroup: React.FC<CheckboxGroupProps>
  export const Modal: React.FC<ModalProps>
  export const Alert: React.FC<AlertProps>
  export const NumericStepper: React.FC<NumericStepperInputProps>
  export const Layout: React.FC<LayoutProps>
  export const PageBlock: React.FC<PageBlockProps>
  export const PageHeader: React.FC<PageHeaderProps>
  export const ButtonWithIcon: React.FC<ButtonWithIconProps>
  export const IconEdit: React.FC<IconEdit>
  export const IconDelete: React.FC<IconDelete>
  export const IconPlus: React.FC<IconPlus>
  export const IconLink: React.FC<{ size?: number }>
  export const Card: React.FC<CardProps>
  export const Toggle: React.FC<ToggleProps>
}
