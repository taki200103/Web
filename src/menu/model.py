from huggingface_hub import InferenceClient

# Tạo client inference
client = InferenceClient(api_key="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")

print("Chatbot is now running. Type your question below (type 'exit' to quit):")

while True:
    # Nhập câu hỏi từ người dùng
    user_input = input("You: ")
    
    # Thoát vòng lặp nếu người dùng nhập 'exit'
    if user_input.strip().lower() == "exit":
        print("Chatbot terminated. Goodbye!")
        break

    # Định dạng tin nhắn
    messages = [
        {
            "role": "user",
            "content": user_input
        }
    ]

    try:
        # Gửi yêu cầu đến mô hình
        completion = client.chat.completions.create(
            model="codellama/CodeLlama-34b-Instruct-hf",
            messages=messages,
            max_tokens=500
        )

        # In câu trả lời
        bot_response = completion.choices[0].message["content"]
        print(f"Bot: {bot_response}")
    except Exception as e:
        print(f"An error occurred: {e}")
