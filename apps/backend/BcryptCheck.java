import org.springframework.security.crypto.bcrypt.BCrypt;
public class BCryptCheck {
  public static void main(String[] args) {
    String hash = "$2a$12$0INDMMLASzdQ6qOYoBdKKOiakQq1kuCBV8D6AmYwKD7/9uAqn7qg6";
    System.out.println("Admin123456! => " + BCrypt.checkpw("Admin123456!", hash));
    System.out.println("Admin123! => " + BCrypt.checkpw("Admin123!", hash));
    System.out.println("Mokha@123! => " + BCrypt.checkpw("Mokha@123!", hash));
  }
}
