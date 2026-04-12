```mermaid
graph TD

  %% -- Constants --
  icons["icons"]:::constant
  payment_method_icons_footer["payment_method_icons_footer"]:::constant

  %% -- Components --
  dynamic_form_component["dynamic-form.component"]:::component
  checkbox_component["checkbox.component"]:::component
  date_component["date.component"]:::component
  datetime_local_component["datetime-local.component"]:::component
  email_component["email.component"]:::component
  file_component["file.component"]:::component
  number_component["number.component"]:::component
  password_component["password.component"]:::component
  radio_component["radio.component"]:::component
  range_component["range.component"]:::component
  search_component["search.component"]:::component
  select_component["select.component"]:::component
  tel_component["tel.component"]:::component
  text_component["text.component"]:::component
  textarea_component["textarea.component"]:::component
  time_component["time.component"]:::component
  url_component["url.component"]:::component
  layout_component["layout.component"]:::component
  breadcrumb_component["breadcrumb.component"]:::component
  card_component["card.component"]:::component
  carousel_component["carousel.component"]:::component
  cart_drawer_component["cart-drawer.component"]:::component
  empty_state_component["empty-state.component"]:::component
  footer_component["footer.component"]:::component
  form_layout_component["form-layout.component"]:::component
  message_component["message.component"]:::component
  modal_component["modal.component"]:::component
  navbar_component["navbar.component"]:::component
  pagination_component["pagination.component"]:::component
  sidebar_component["sidebar.component"]:::component
  spinner_component["spinner.component"]:::component
  table_layout_component["table-layout.component"]:::component
  tree_list_layout_component["tree-list-layout.component"]:::component
  my_lib_inside_component["my-lib-inside.component"]:::component
  base_input_component_component["base-input-component.component"]:::component

  %% -- Pipes --
  format_likes_pipe["format-likes.pipe"]:::pipe
  truncate_words_pipe["truncate-words.pipe"]:::pipe

  %% -- Interfaces --
  advertisement_item_interface["advertisement_item.interface"]:::interface
  breadcrumb_item_interface["breadcrumb_item.interface"]:::interface
  carousel_item_interface["carousel_item.interface"]:::interface
  field_change_event_interface["field_change-event.interface"]:::interface
  form_button_interface["form_button.interface"]:::interface
  form_config_interface["form_config.interface"]:::interface
  form_field_config_interface["form_field_config.interface"]:::interface
  form_status_interface["form_status.interface"]:::interface
  footer_link_interface["footer_link.interface"]:::interface
  footer_payment_method_interface["footer_payment_method.interface"]:::interface
  input_component_interface["input_component.interface"]:::interface
  menu_item_interface["menu-item.interface"]:::interface
  message_item_interface["message_item.interface"]:::interface
  modal_action_interface["modal_action.interface"]:::interface
  table_action_interface["table_action.interface"]:::interface
  table_column_interface["table_column.interface"]:::interface

  %% -- Services --
  message_service["message.service"]:::service
  navbar_service["navbar.service"]:::service
  sidebar_service["sidebar.service"]:::service

  %% -- Utils --
  input_component_map["input-component-map"]:::util

  dynamic_form_component --> input_component_map
  dynamic_form_component --> base_input_component_component
  dynamic_form_component --> form_config_interface
  dynamic_form_component --> field_change_event_interface
  dynamic_form_component --> form_field_config_interface
  dynamic_form_component --> form_button_interface
  dynamic_form_component --> form_status_interface
  checkbox_component --> base_input_component_component
  email_component --> base_input_component_component
  password_component --> input_component_interface
  password_component --> base_input_component_component
  text_component --> base_input_component_component
  breadcrumb_component --> breadcrumb_item_interface
  card_component --> advertisement_item_interface
  card_component --> truncate_words_pipe
  card_component --> format_likes_pipe
  footer_component --> carousel_item_interface
  footer_component --> footer_link_interface
  footer_component --> footer_payment_method_interface
  form_layout_component --> modal_action_interface
  message_component --> message_item_interface
  message_component --> message_service
  modal_component --> modal_action_interface
  navbar_component --> menu_item_interface
  navbar_component --> sidebar_service
  navbar_component --> breadcrumb_item_interface
  navbar_component --> navbar_service
  sidebar_component --> menu_item_interface
  sidebar_component --> sidebar_service
  sidebar_component --> breadcrumb_item_interface
  sidebar_component --> navbar_service
  table_layout_component --> table_column_interface
  table_layout_component --> pagination_component
  table_layout_component --> table_action_interface
  table_layout_component --> empty_state_component
  tree_list_layout_component --> empty_state_component
  tree_list_layout_component --> pagination_component
  tree_list_layout_component --> table_action_interface
  form_config_interface --> form_button_interface
  form_config_interface --> form_field_config_interface
  form_field_config_interface --> form_button_interface
  message_service --> message_item_interface
  base_input_component_component --> input_component_interface
  input_component_map --> checkbox_component
  input_component_map --> date_component
  input_component_map --> datetime_local_component
  input_component_map --> email_component
  input_component_map --> file_component
  input_component_map --> number_component
  input_component_map --> password_component
  input_component_map --> radio_component
  input_component_map --> range_component
  input_component_map --> search_component
  input_component_map --> tel_component
  input_component_map --> text_component
  input_component_map --> textarea_component
  input_component_map --> time_component
  input_component_map --> url_component
  input_component_map --> select_component

  classDef component fill:#3b82f6,stroke:#000,stroke-width:1px,color:#fff
  classDef service fill:#10b981,stroke:#000,stroke-width:1px,color:#fff
  classDef interface fill:#8b5cf6,stroke:#000,stroke-width:1px,color:#fff
  classDef pipe fill:#f97316,stroke:#000,stroke-width:1px,color:#fff
  classDef constant fill:#fbbf24,stroke:#000,stroke-width:1px,color:#fff
  classDef util fill:#49ae5d,stroke:#000,stroke-width:1px,color:#fff
```