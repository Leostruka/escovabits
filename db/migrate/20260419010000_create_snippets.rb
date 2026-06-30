class CreateSnippets < ActiveRecord::Migration[8.0]
  def change
    create_table :snippets do |t|
      t.string :slug, null: false
      t.text :source_code
      t.string :language
      t.string :compiler_flags

      t.timestamps
    end
    add_index :snippets, :slug, unique: true
  end
end
