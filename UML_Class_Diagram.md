# UML Class Diagram for EscovaBits# UML Class Diagram for EscovaBits



Este diagrama representa as principais classes do seu projeto Rails, incluindo controladores, serviços e dependências. O formato é PlantUML, pronto para visualização.This is a PlantUML representation of the application's class structure.



```plantuml```plantuml

@startuml EscovaBits_Class_Diagram@startuml EscovaBits_Class_Diagram

!theme plain!theme plain



' Controladores Rails' Rails Framework Classes (Abstract)

class ApplicationController {abstract class ActionController {

  + allow_browser(versions: Symbol)  - allow_browser: Symbol

}}



class CompilerController {abstract class ActiveRecord {

  + index()  + primary_abstract_class

  + compile()}

  + hello_world()

}class ApplicationController {

  + allow_browser(versions: Symbol)

ApplicationController <|-- CompilerController}



' Model baseclass CompilerController {

class ApplicationRecord {  - @source_code: String

}  - @assembly_output: String

  + index()

' Serviços  + compile()

class CompilationService {  + hello_world()

  + call(source_code, language, command_template)  - build_command(language: String, user_flags: Array): Array

  - execute_command(command)}

}

' Models

class AssemblyFilterService {class ApplicationRecord {

  + call(assembly_output, language)}

}

' Service Classes

class LanguageConfigService {class CompilationService {

  + hello_world_for(language)  - COMPILER_TIMEOUT: Integer = 10

  + extension_for(language)  - @source_code: String

  + needs_outfile?(language)  - @language: String

  + command_for(language, user_flags)  - @command_template: Array

}  + call(source_code: String, language: String, command_template: Array): String

  - initialize(source_code: String, language: String, command_template: Array)

CompilerController --> LanguageConfigService  - call(): String

CompilerController --> CompilationService  - execute_command(command: Array): String

CompilerController --> AssemblyFilterService  - build_command(temp_file_path: String, output_file_path: String): Array

CompilationService --> LanguageConfigService}



@endumlclass AssemblyFilterService {

```  - FILTERS: Hash

  - @assembly_output: String

## Como visualizar  - @language: String

Use uma extensão PlantUML no VS Code ou um visualizador online para renderizar o diagrama.  - @config: Hash

  + call(assembly_output: String, language: String): String

Se quiser incluir mais classes ou detalhes, só avisar!  - initialize(assembly_output: String, language: String)
  - call(): String
  - find_used_labels(lines: Array): Set
  - process_lines(lines: Array, used_labels: Set): String
  - should_keep_line?(line: String, used_labels: Set): Boolean
  - remove_comments(line: String): String
}

class LanguageConfigService {
  - LANGUAGES: Hash
  + hello_world_for(language: String): String
  + extension_for(language: String): String
  + needs_outfile?(language: String): Boolean
  + command_for(language: String, user_flags: Array): Array
}

' JavaScript/Stimulus Controllers
class CompilerController_JS {
  - compileTimeout: Number
  - countdownInterval: Number
  - outputObserver: MutationObserver
  + connect()
  + disconnect()
  + startDebouncedCompile()
  + compile()
  + onLanguageChange()
  + initializeOutputObserver()
  + updateLineNumbers(textarea: Element, target: Element)
  + syncScroll(event: Event)
}

class StimulusApplication {
  - debug: Boolean = false
  + start(): Application
}

' Inheritance Relationships
ActionController <|-- ApplicationController
ApplicationController <|-- CompilerController
ActiveRecord <|-- ApplicationRecord

' Dependencies and Associations
CompilerController --> LanguageConfigService : uses
CompilerController --> CompilationService : uses
CompilerController --> AssemblyFilterService : uses

CompilationService --> LanguageConfigService : uses

' Service Object Pattern
note right of CompilationService
  Service Object Pattern
  Handles compilation logic
  Uses Open3 for command execution
  Implements timeout mechanism
end note

note right of AssemblyFilterService
  Service Object Pattern
  Filters assembly output
  Supports multiple languages
  Removes unnecessary directives
end note

note right of LanguageConfigService
  Configuration Service
  Defines language-specific settings
  Provides hello world templates
  Manages compiler commands
end note

note right of CompilerController_JS
  Stimulus Controller
  Handles frontend interactions
  Implements debounced compilation
  Manages UI updates
end note

' Language Configuration Structure
class LanguageConfig <<value object>> {
  + hello_world: String
  + extension: String
  + needs_outfile: Boolean
  + command: Lambda
}

LanguageConfigService --> LanguageConfig : contains

' Filter Configuration Structure
class FilterConfig <<value object>> {
  + directive_regex: Regexp
  + label_regex: Regexp
  + comment_regex: Regexp
  + filter_numeric_labels: Boolean
}

AssemblyFilterService --> FilterConfig : contains

@enduml
```

## Key Components Analysis

### Backend Architecture

#### Controllers Layer
- **ApplicationController**: Base controller with modern browser requirements
- **CompilerController**: Main controller handling compilation requests with three actions:
  - `index`: Displays the main compiler interface
  - `compile`: Processes compilation requests and returns assembly output
  - `hello_world`: Returns language-specific hello world code

#### Service Layer (Service Object Pattern)
- **CompilationService**: Handles the core compilation logic
  - Creates temporary files for source code
  - Executes compiler commands with timeout protection
  - Manages different language compilation processes

- **AssemblyFilterService**: Post-processes assembly output
  - Removes unnecessary compiler directives and comments
  - Filters out unused labels and debugging information
  - Supports language-specific filtering rules

- **LanguageConfigService**: Centralized language configuration
  - Stores hello world templates for each language
  - Manages file extensions and compiler commands
  - Handles language-specific compilation flags

#### Models Layer
- **ApplicationRecord**: Base model class (no domain models in this compiler app)

### Frontend Architecture

#### JavaScript/Stimulus Controllers
- **CompilerController (JS)**: Frontend interaction handler
  - Implements debounced compilation (2.5s delay)
  - Manages UI updates and line numbering
  - Handles language switching and flag management
  - Provides real-time feedback with countdown timers

### Supported Languages
Currently supports:
- **C++**: Using g++ compiler with Intel assembly syntax
- **Go**: Using go build with assembly output

### Key Design Patterns
1. **Service Object Pattern**: Business logic encapsulated in service classes
2. **Configuration Pattern**: Language settings centralized in LanguageConfigService
3. **Template Method**: Different compilation strategies per language
4. **Observer Pattern**: MutationObserver for UI updates in JavaScript

This application demonstrates a clean separation of concerns with Rails backend handling compilation and Stimulus frontend providing interactive user experience.
