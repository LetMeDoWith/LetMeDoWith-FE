import UserNotifications
import os

/// FCM 이미지 알림(`fcm_options.image`)을 다운로드해 알림에 첨부하는 Notification Service Extension.
///
/// - 순수 Swift(URLSession) 구현이라 확장 타겟에 별도 Pod(Firebase) 의존성이 필요 없습니다.
/// - APNs payload에 `mutable-content: 1`이 있어야 이 확장이 호출됩니다.
///   (FCM은 이미지를 설정하면 자동으로 `mutable-content`를 추가합니다.)
/// - 디버깅: Console.app에서 subsystem `com.teamdowith.letmedowith2.NotificationService`(category `NSE`)로 필터.
final class NotificationService: UNNotificationServiceExtension {
  private static let logger = Logger(
    subsystem: "com.teamdowith.letmedowith2.NotificationService",
    category: "NSE"
  )

  private var contentHandler: ((UNNotificationContent) -> Void)?
  private var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    self.bestAttemptContent = request.content.mutableCopy() as? UNMutableNotificationContent

    let userInfo = request.content.userInfo
    Self.logger.log("✅ NSE didReceive 호출됨. userInfo keys: \(userInfo.keys.map { "\($0)" }.joined(separator: ", "), privacy: .public)")

    guard let bestAttemptContent = bestAttemptContent else {
      Self.logger.error("❌ mutableCopy 실패 — 원본 알림 그대로 표시")
      contentHandler(request.content)
      return
    }

    // 이미지 URL이 없으면 원본 알림 그대로 표시
    guard let imageURL = Self.imageURL(from: userInfo) else {
      Self.logger.error("⚠️ 이미지 URL 없음(fcm_options.image / image 모두 미존재) — 텍스트만 표시")
      contentHandler(bestAttemptContent)
      return
    }

    Self.logger.log("⬇️ 이미지 다운로드 시작: \(imageURL.absoluteString, privacy: .public)")

    Self.downloadAttachment(from: imageURL) { attachment in
      if let attachment = attachment {
        bestAttemptContent.attachments = [attachment]
        Self.logger.log("🖼️ 이미지 첨부 성공")
      } else {
        Self.logger.error("❌ 이미지 다운로드/첨부 실패 — 텍스트만 표시")
      }
      contentHandler(bestAttemptContent)
    }
  }

  override func serviceExtensionTimeWillExpire() {
    // 시스템이 확장 실행 시간을 회수하기 직전 호출 → 이미지가 준비 안 됐어도 알림은 표시
    Self.logger.error("⏰ serviceExtensionTimeWillExpire — 시간 초과로 이미지 없이 표시")
    if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }

  /// FCM payload에서 이미지 URL 추출 (`fcm_options.image` 우선, `image` 폴백)
  private static func imageURL(from userInfo: [AnyHashable: Any]) -> URL? {
    if let fcmOptions = userInfo["fcm_options"] as? [String: Any],
       let urlString = fcmOptions["image"] as? String,
       let url = URL(string: urlString) {
      return url
    }
    if let urlString = userInfo["image"] as? String, let url = URL(string: urlString) {
      return url
    }
    return nil
  }

  private static func downloadAttachment(
    from url: URL,
    completion: @escaping (UNNotificationAttachment?) -> Void
  ) {
    let task = URLSession.shared.downloadTask(with: url) { location, response, error in
      if let error = error {
        Self.logger.error("❌ 다운로드 에러: \(error.localizedDescription, privacy: .public)")
      }
      guard let location = location else {
        completion(nil)
        return
      }

      let fileManager = FileManager.default
      // iOS가 첨부 타입을 인식하려면 파일 확장자가 필요
      let fileName = UUID().uuidString + Self.fileExtension(url: url, response: response)
      let destination = fileManager.temporaryDirectory.appendingPathComponent(fileName)

      do {
        try fileManager.moveItem(at: location, to: destination)
        let attachment = try UNNotificationAttachment(identifier: "image", url: destination, options: nil)
        completion(attachment)
      } catch {
        Self.logger.error("❌ 첨부 생성 실패: \(error.localizedDescription, privacy: .public)")
        completion(nil)
      }
    }
    task.resume()
  }

  private static func fileExtension(url: URL, response: URLResponse?) -> String {
    switch response?.mimeType {
    case "image/jpeg": return ".jpg"
    case "image/png": return ".png"
    case "image/gif": return ".gif"
    case "image/webp": return ".webp"
    default:
      let pathExtension = url.pathExtension
      return pathExtension.isEmpty ? ".jpg" : "." + pathExtension
    }
  }
}
