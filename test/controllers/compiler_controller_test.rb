require "test_helper"

class CompilerControllerTest < ActionDispatch::IntegrationTest
  test "Deve retornar a página inicial" do
    get root_url
    assert_response :success
  end

  test "Deve retornar o código-fonte do Hello, World! para C++" do
    get hello_world_url(language: "cpp")
    assert_response :success
    assert_includes @response.body, "Hello, World!"
  end

  test "Deve compilar o código-fonte c++" do
    post compile_url, params: {
      source_code: "int main() { return 0; }",
      language: "cpp"
    }

    assert_response :success
    assert_includes @response.body, "output_frame"
  end

  test "Deve criar um snippet e retornar uma URL compartilhada" do
    post share_url, params: {
      source_code: "int main() { return 0; }",
      language: "cpp",
      compiler_flags: "-O2"
    }

    assert_response :success
    assert_equal "application/json", @response.media_type
    assert_match(/\/s\//, @response.body)
    assert_equal 1, Snippet.count
    puts @response.body
  end

  test "Deve renderizar a página de snippets" do
    snippet = Snippet.create!(source_code: "int main() { return 0; }", language: "cpp", compiler_flags: "-O2")

    get "/s/#{snippet.slug}"

    assert_response :success
    assert_includes @response.body, snippet.source_code
  end
end
