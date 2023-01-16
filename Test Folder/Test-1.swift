import SwiftUI


struct ContentView: View {
    var body: some View {
        return RoundedRectangle (cornerRadius: 20)
    
        Text{"Hello, world!"}.foregroundColor(.orange).padding()

    }    
}

class MyNew_Preview: WebPreview {
	override class var title: String { "My preview" } // optional
	override class var width: UInt { 100 } // optional
	override class var height: UInt { 100 } // optional

	@Preview override class var content: Preview.Content {
		// add styles if needed
		// AppStyles.id(.happyStyle)
		// add here as many elements as needed
		Div("Hello world")
	}
}
