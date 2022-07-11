class Solution {
    static final int MOD = (int) 1e9 + 7, MX_K = 13, MX = (int) 1e4 + MX_K;
    static List[] ks = new List[MX]; // ks[x] 为 x 分解质因数后，每个质因数的个数列表
    static int[][] c = new int[MX][MX_K + 1]; // 组合数

    static {
        for (var i = 1; i < MX; i++) {
            ks[i] = new ArrayList<Integer>();
            var x = i;
            for (var p = 2; p * p <= x; ++p) {
                if (x % p == 0) {
                    var k = 0;
                    for (; x % p == 0; x /= p) ++k;
                    ks[i].add(k);
                }
            }
            if (x > 1) ks[i].add(1);
        }

        c[0][0] = 1;
        for (int i = 1; i < MX; ++i) {
            c[i][0] = 1;
            for (int j = 1; j <= Math.min(i, MX_K); ++j)
                c[i][j] = (c[i - 1][j] + c[i - 1][j - 1]) % MOD;
        }
    }

    public int idealArrays(int n, int maxValue) {
        var ans = 0L;
        for (var x = 1; x <= maxValue; ++x) {
            var mul = 1L;
            for (var k : ks[x]) mul = mul * c[n + (int) k - 1][(int) k] % MOD;
            ans += mul;
        }
        return (int) (ans % MOD);
    }
}

// 作者：endlesscheng
// 链接：https://leetcode.cn/problems/count-the-number-of-ideal-arrays/solution/shu-lun-zu-he-shu-xue-zuo-fa-by-endlessc-iouh/
// 来源：力扣（LeetCode）
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。