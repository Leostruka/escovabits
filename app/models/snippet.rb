class Snippet < ApplicationRecord
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    loop do
      self.slug = SecureRandom.alphanumeric(8)
      break unless Snippet.exists?(slug: slug)
    end if slug.blank?
  end
end
