package local.governance.measurements;

import java.lang.management.ManagementFactory;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Locale;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;

public final class Argon2Measurement {
    private Argon2Measurement() {}

    public static void main(String[] args) {
        if (args.length != 2) {
            throw new IllegalArgumentException("Expected memoryKiB and iterations");
        }
        int memoryKiB = Integer.parseInt(args[0]);
        int iterations = Integer.parseInt(args[1]);
        if ((memoryKiB != 19456 || iterations != 2)
                && (memoryKiB != 65536 || iterations != 3)) {
            throw new IllegalArgumentException("Only the two bounded reference profiles are allowed");
        }
        SecureRandom random = new SecureRandom();
        byte[] password = new byte[32];
        byte[] salt = new byte[16];
        random.nextBytes(password);
        random.nextBytes(salt);
        Argon2Parameters parameters = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withMemoryAsKB(memoryKiB)
                .withIterations(iterations)
                .withParallelism(1)
                .withSalt(salt)
                .build();
        long[] samples = new long[7];
        try {
            for (int i = 0; i < 2; i++) {
                hash(password, parameters);
            }
            for (var pool : ManagementFactory.getMemoryPoolMXBeans()) {
                pool.resetPeakUsage();
            }
            for (int i = 0; i < samples.length; i++) {
                long started = System.nanoTime();
                hash(password, parameters);
                samples[i] = System.nanoTime() - started;
            }
            long[] sorted = samples.clone();
            Arrays.sort(sorted);
            long peakHeapPoolBytes = ManagementFactory.getMemoryPoolMXBeans().stream()
                    .filter(pool -> pool.getType() == java.lang.management.MemoryType.HEAP)
                    .mapToLong(pool -> pool.getPeakUsage().getUsed())
                    .sum();
            StringBuilder values = new StringBuilder();
            for (long sample : samples) {
                if (!values.isEmpty()) {
                    values.append(',');
                }
                values.append(String.format(Locale.ROOT, "%.3f", sample / 1_000_000.0));
            }
            System.out.printf(Locale.ROOT,
                    "{\"javaVersion\":\"%s\",\"provider\":\"BouncyCastle 1.86\","
                            + "\"algorithm\":\"Argon2id\",\"argonVersion\":19,"
                            + "\"memoryKiB\":%d,\"iterations\":%d,\"parallelism\":1,"
                            + "\"saltBytes\":16,\"outputBytes\":32,"
                            + "\"warmups\":2,\"samples\":7,\"concurrency\":1,"
                            + "\"sampleMilliseconds\":[%s],\"medianMilliseconds\":%.3f,"
                            + "\"maximumMilliseconds\":%.3f,\"jvmMaxHeapBytes\":%d,"
                            + "\"sumOfHeapPoolPeaksBytes\":%d}%n",
                    System.getProperty("java.version"), memoryKiB, iterations, values,
                    sorted[sorted.length / 2] / 1_000_000.0,
                    sorted[sorted.length - 1] / 1_000_000.0,
                    Runtime.getRuntime().maxMemory(), peakHeapPoolBytes);
        } finally {
            Arrays.fill(password, (byte) 0);
            Arrays.fill(salt, (byte) 0);
            parameters.clear();
        }
    }

    private static void hash(byte[] password, Argon2Parameters parameters) {
        byte[] result = new byte[32];
        try {
            Argon2BytesGenerator generator = new Argon2BytesGenerator();
            generator.init(parameters);
            generator.generateBytes(password, result);
        } finally {
            Arrays.fill(result, (byte) 0);
        }
    }
}
